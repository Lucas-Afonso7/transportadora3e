"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/session";
import { hashPassword, generateRandomPassword } from "@/lib/auth/password";
import { isValidDocNumberFormat } from "@/lib/doc-number";
import { parseAmountInput } from "@/lib/money";
import { computeApprovedAmount } from "@/lib/payments";

// Sem isso, os links de navegação (sempre visíveis no cabeçalho, e por
// isso sempre pré-carregados pelo Next) continuam mostrando a versão
// antiga da lista/ficha do cliente até um reload manual.
function revalidateEverything() {
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Cliente
// ---------------------------------------------------------------------------

export type CreateClientFormState = {
  error: string | null;
  created: { id: number; docNumber: string; name: string; password: string } | null;
};

// Limite de 191 caracteres em todo campo de texto livre bate com o
// VARCHAR(191) real das colunas (padrão do Prisma pra MySQL — ver
// migration.sql). Sem isso, um texto maior passava pela validação e só
// quebrava na hora de gravar, com um erro cru do banco em vez de uma
// mensagem que faça sentido pra quem preencheu o formulário.
const MAX_TEXT_FIELD_LENGTH = 191;

const createClientSchema = z.object({
  // Sempre normaliza pra só dígitos antes de gravar — o login (ver
  // src/app/entrar/actions.ts) faz o mesmo antes de buscar no banco. Se
  // esse cadastro guardasse o CPF com pontuação (o que o admin digitou
  // naturalmente), o login nunca acharia o cliente: "529.982.247-25"
  // salvo aqui nunca bate com "52998224725" que o login procura.
  docNumber: z
    .string()
    .trim()
    .min(1, "Informe o CPF ou CNPJ.")
    .max(MAX_TEXT_FIELD_LENGTH, "CPF/CNPJ inválido.")
    .transform((value) => value.replace(/\D/g, "")),
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome.")
    .max(MAX_TEXT_FIELD_LENGTH, "Nome muito longo (máximo 191 caracteres)."),
  phone: z
    .string()
    .trim()
    .min(1, "Informe o telefone.")
    .max(MAX_TEXT_FIELD_LENGTH, "Telefone muito longo."),
  email: z.string().trim().max(MAX_TEXT_FIELD_LENGTH, "E-mail muito longo."),
});

export async function createClientAction(
  _prevState: CreateClientFormState,
  formData: FormData,
): Promise<CreateClientFormState> {
  await requireAdminSession();

  const parsed = createClientSchema.safeParse({
    docNumber: formData.get("docNumber"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, created: null };
  }

  const { docNumber, name, phone } = parsed.data;

  // docNumber já vem só com dígitos (transform acima). Duas mensagens
  // diferentes de propósito: "tamanho errado" (11/14 dígitos) é um erro
  // bem diferente de "dígito verificador não fecha" (CPF/CNPJ com o
  // tamanho certo, mas inventado ou digitado errado) — a mensagem antiga
  // dizia sempre "deve ter 11 ou 14 dígitos" pros dois casos, o que confundia
  // quem já tinha digitado a quantidade certa de números.
  if (docNumber.length !== 11 && docNumber.length !== 14) {
    return { error: "CPF/CNPJ deve ter 11 ou 14 dígitos.", created: null };
  }
  if (!isValidDocNumberFormat(docNumber)) {
    return {
      error: "CPF/CNPJ inválido — confira os números digitados.",
      created: null,
    };
  }

  let email: string | null = null;
  const emailRaw = parsed.data.email.trim();
  if (emailRaw.length > 0) {
    const emailCheck = z.email("E-mail inválido.").safeParse(emailRaw);
    if (!emailCheck.success) {
      return { error: "E-mail inválido.", created: null };
    }
    email = emailCheck.data;
  }

  const existing = await prisma.client.findUnique({ where: { docNumber } });
  if (existing) {
    return {
      error: "Já existe um cliente cadastrado com esse CPF/CNPJ.",
      created: null,
    };
  }

  const password = generateRandomPassword();
  const passwordHash = await hashPassword(password);

  const client = await prisma.client.create({
    data: { docNumber, name, phone, email, passwordHash },
  });

  revalidateEverything();

  return {
    error: null,
    created: { id: client.id, docNumber: client.docNumber, name: client.name, password },
  };
}

const updateClientSchema = z.object({
  clientId: z.coerce.number().int().positive(),
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome.")
    .max(MAX_TEXT_FIELD_LENGTH, "Nome muito longo (máximo 191 caracteres)."),
  phone: z
    .string()
    .trim()
    .min(1, "Informe o telefone.")
    .max(MAX_TEXT_FIELD_LENGTH, "Telefone muito longo."),
  email: z.string().trim().max(MAX_TEXT_FIELD_LENGTH, "E-mail muito longo."),
});

// docNumber propositalmente não é editável aqui: é o login do cliente, e
// trocar silenciosamente derrubaria o acesso dele sem aviso. Se um CPF/CNPJ
// foi cadastrado errado, o caminho é criar o cliente de novo.
export async function updateClientAction(formData: FormData) {
  await requireAdminSession();

  const parsed = updateClientSchema.safeParse({
    clientId: formData.get("clientId"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
  });

  if (!parsed.success) {
    redirect("/admin/clientes?erro=dados_invalidos");
  }

  const { clientId, name, phone } = parsed.data;
  const emailRaw = parsed.data.email.trim();

  let email: string | null = null;
  if (emailRaw.length > 0) {
    const emailCheck = z.email().safeParse(emailRaw);
    if (!emailCheck.success) {
      redirect(`/admin/clientes/${clientId}?erro=email_invalido`);
    }
    email = emailCheck.data;
  }

  await prisma.client.update({
    where: { id: clientId },
    data: { name, phone, email },
  });

  revalidateEverything();
  redirect(`/admin/clientes/${clientId}?sucesso=cliente_atualizado`);
}

export type RegeneratePasswordFormState = {
  error: string | null;
  newPassword: string | null;
};

export async function regeneratePasswordAction(
  _prevState: RegeneratePasswordFormState,
  formData: FormData,
): Promise<RegeneratePasswordFormState> {
  await requireAdminSession();

  const clientId = Number(formData.get("clientId"));
  if (!Number.isInteger(clientId) || clientId <= 0) {
    return { error: "Cliente inválido.", newPassword: null };
  }

  const password = generateRandomPassword();
  const passwordHash = await hashPassword(password);

  // Reseta bloqueio junto: se o cliente estava travado por tentativas
  // inválidas, uma senha nova sem destravar a conta deixaria o admin
  // achando que resolveu o problema sem ter resolvido.
  await prisma.client.update({
    where: { id: clientId },
    data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
  });

  return { error: null, newPassword: password };
}

// ---------------------------------------------------------------------------
// Serviço
// ---------------------------------------------------------------------------

const serviceFieldsSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Informe a descrição do serviço.")
    .max(
      MAX_TEXT_FIELD_LENGTH,
      "Descrição muito longa (máximo 191 caracteres).",
    ),
  serviceDate: z.string().trim().min(1, "Informe a data do serviço."),
  dueDate: z.string().trim(),
});

function parseServiceDate(raw: string): Date | null {
  // Vem de <input type="date">, formato YYYY-MM-DD. Monta em UTC pra bater
  // com o que a coluna @db.Date espera (meia-noite UTC) — new Date("YYYY-MM-DD")
  // já interpreta como UTC nativamente, então só validar que não é inválida.
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createServiceAction(formData: FormData) {
  await requireAdminSession();

  const clientId = Number(formData.get("clientId"));
  if (!Number.isInteger(clientId) || clientId <= 0) {
    redirect("/admin/clientes?erro=dados_invalidos");
  }

  const parsed = serviceFieldsSchema.safeParse({
    description: formData.get("description"),
    serviceDate: formData.get("serviceDate"),
    dueDate: formData.get("dueDate") ?? "",
  });

  if (!parsed.success) {
    redirect(`/admin/clientes/${clientId}?erro=dados_invalidos`);
  }

  const amount = parseAmountInput(formData.get("totalAmount"));
  if (!amount) {
    redirect(`/admin/clientes/${clientId}?erro=valor_invalido`);
  }

  const serviceDate = parseServiceDate(parsed.data.serviceDate);
  if (!serviceDate) {
    redirect(`/admin/clientes/${clientId}?erro=data_invalida`);
  }

  let dueDate: Date | null = null;
  if (parsed.data.dueDate.trim().length > 0) {
    dueDate = parseServiceDate(parsed.data.dueDate.trim());
    if (!dueDate) {
      redirect(`/admin/clientes/${clientId}?erro=data_invalida`);
    }
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    redirect("/admin/clientes?erro=cliente_nao_encontrado");
  }

  await prisma.service.create({
    data: {
      clientId,
      description: parsed.data.description,
      totalAmount: amount,
      serviceDate,
      dueDate,
    },
  });

  revalidateEverything();
  redirect(`/admin/clientes/${clientId}?sucesso=servico_criado`);
}

export async function updateServiceAction(formData: FormData) {
  await requireAdminSession();

  const serviceId = Number(formData.get("serviceId"));
  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    redirect("/admin/clientes?erro=dados_invalidos");
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { payments: { select: { amount: true, status: true } } },
  });

  if (!service) {
    redirect("/admin/clientes?erro=servico_nao_encontrado");
  }

  const parsed = serviceFieldsSchema.safeParse({
    description: formData.get("description"),
    serviceDate: formData.get("serviceDate"),
    dueDate: formData.get("dueDate") ?? "",
  });

  if (!parsed.success) {
    redirect(`/admin/clientes/${service.clientId}?erro=dados_invalidos`);
  }

  const amount = parseAmountInput(formData.get("totalAmount"));
  if (!amount) {
    redirect(`/admin/clientes/${service.clientId}?erro=valor_invalido`);
  }

  // Não deixa o valor total cair abaixo do que já foi aprovado — senão o
  // serviço ficaria "mais pago do que o valor devido", uma inconsistência
  // financeira que não devia ser possível de criar pela UI.
  const approved = computeApprovedAmount(service.payments);
  if (amount.lt(approved)) {
    redirect(`/admin/clientes/${service.clientId}?erro=valor_abaixo_do_pago`);
  }

  const serviceDate = parseServiceDate(parsed.data.serviceDate);
  if (!serviceDate) {
    redirect(`/admin/clientes/${service.clientId}?erro=data_invalida`);
  }

  let dueDate: Date | null = null;
  if (parsed.data.dueDate.trim().length > 0) {
    dueDate = parseServiceDate(parsed.data.dueDate.trim());
    if (!dueDate) {
      redirect(`/admin/clientes/${service.clientId}?erro=data_invalida`);
    }
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      description: parsed.data.description,
      totalAmount: amount,
      serviceDate,
      dueDate,
    },
  });

  revalidateEverything();
  redirect(`/admin/clientes/${service.clientId}?sucesso=servico_atualizado`);
}
