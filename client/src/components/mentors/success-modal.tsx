import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorName: string;
  sessionDate: string;
  sessionTime: string;
}

export default function SuccessModal({
  isOpen,
  onClose,
  mentorName,
  sessionDate,
  sessionTime,
}: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 md:mx-auto p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-secondary" />
          </div>
          <h3 className="text-lg font-medium text-neutral-default mb-2">
            Session Request Submitted!
          </h3>
          <p className="text-sm text-neutral mb-6">
            Your session request with {mentorName} for {sessionDate}, {sessionTime} has been submitted.
          </p>
          
          <div className="bg-neutral-lighter rounded-md p-4 mb-6 text-left">
            <h4 className="font-medium mb-2">What's Next?</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-secondary mr-2 flex-shrink-0" />
                <span>Your request is awaiting approval from {mentorName}</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-secondary mr-2 flex-shrink-0" />
                <span>
                  Once approved, you'll receive a confirmation with the Google Meet link
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-secondary mr-2 flex-shrink-0" />
                <span>You can track the status of your request in the "My Sessions" section</span>
              </li>
            </ul>
          </div>
          
          <div className="flex justify-center">
            <Button onClick={onClose}>Return to Dashboard</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
