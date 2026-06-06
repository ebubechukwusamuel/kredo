"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { deleteProposal, updateProposalStatus } from "@/app/actions/proposal"

export function ProposalActions({
  proposalId,
  status,
  clientEmail,
}: {
  proposalId: string
  status: string
  clientEmail: string | null
}) {
  const router = useRouter()

  return (
    <div className="flex flex-wrap gap-2">
      {status === "DRAFT" && (
        <Button
          onClick={async () => {
            await updateProposalStatus(proposalId, "SENT")
          }}
        >
          Mark as Sent
        </Button>
      )}
      {status === "SENT" && (
        <>
          <Button
            onClick={async () => {
              await updateProposalStatus(proposalId, "ACCEPTED")
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Mark Accepted
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await updateProposalStatus(proposalId, "DECLINED")
            }}
            className="text-red-600"
          >
            Mark Declined
          </Button>
        </>
      )}
      {status !== "DRAFT" && status !== "SENT" && (
        <Button
          variant="outline"
          onClick={async () => {
            await updateProposalStatus(proposalId, "SENT")
          }}
        >
          Reopen
        </Button>
      )}
      {(status === "DRAFT" || status === "DECLINED" || status === "EXPIRED") && (
        <Button
          variant="outline"
          onClick={async () => {
            if (confirm("Delete this proposal?")) {
              await deleteProposal(proposalId)
            }
          }}
          className="text-destructive"
        >
          Delete
        </Button>
      )}
    </div>
  )
}
