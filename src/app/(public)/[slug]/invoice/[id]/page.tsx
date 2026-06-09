import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { ClientPaymentPage } from "@/components/forms/client-payment-page"

export default async function InvoicePaymentPage(
  props: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await props.params

  const user = await prisma.user.findUnique({ where: { slug } })
  if (!user) notFound()

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
    include: {
      items: true,
      client: { select: { name: true, email: true, company: true, phone: true, address: true } },
    },
  })
  if (!invoice) notFound()

  const request = await prisma.projectRequest.findFirst({
    where: { invoiceId: id },
  })

  const clientData = invoice.client || {
    name: request?.clientName || "Client",
    email: request?.clientEmail,
    company: request?.company,
    phone: request?.clientPhone,
    address: null,
  }

  return (
    <ClientPaymentPage
      invoice={{
        number: invoice.number,
        amount: invoice.amount,
        total: invoice.total,
        depositAmount: invoice.depositAmount || invoice.total * 0.5,
        currency: invoice.currency,
        items: invoice.items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          rate: i.rate,
          amount: i.amount,
        })),
        terms: invoice.terms,
      }}
      client={{
        name: clientData.name,
        email: clientData.email ?? "",
        company: clientData.company ?? "",
        phone: clientData.phone ?? "",
        address: clientData.address ?? "",
      }}
      freelancer={{
        name: user.brandName || user.name || "Freelancer",
        brandColor: user.brandColor || "#e85d3a",
        logoUrl: user.logoUrl,
        bankName: user.bankName,
        bankAccountName: user.bankAccountName,
        bankAccountNumber: user.bankAccountNumber,
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        company: user.company || "",
      }}
      invoiceId={id}
    />
  )
}
