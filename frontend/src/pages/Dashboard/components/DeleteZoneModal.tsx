import { Button } from "baseui/button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "baseui/modal";
import { useDeleteZoneMutation } from "../../../shared/api/queries/use-zones";
import type { Zone } from "../../../shared/api/types";
import { addToast, useAppDispatch } from "../../../shared/redux";

interface DeleteZoneModalProps {
  zone: Zone | null;
  onClose: () => void;
}

export function DeleteZoneModal({ zone, onClose }: DeleteZoneModalProps) {
  const deleteMutation = useDeleteZoneMutation();
  const dispatch = useAppDispatch();

  const handleConfirm = async () => {
    if (!zone) return;
    try {
      await deleteMutation.mutateAsync(zone.id);
      dispatch(addToast({ type: "success", message: "Zone deleted" }));
      onClose();
    } catch {
      // Error toast from mutation default
    }
  };

  const isOpen = Boolean(zone);

  return (
    <Modal isOpen={isOpen} onClose={() => onClose()} closeable>
      <ModalHeader>Delete zone</ModalHeader>
      <ModalBody>
        {zone && (
          <p style={{ margin: 0 }}>
            Delete &quot;{zone.name}&quot; ({zone.city_name})? This cannot be undone.
          </p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="tertiary" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button
          kind="dangerPrimary"
          onClick={handleConfirm}
          isLoading={deleteMutation.isPending}
          disabled={deleteMutation.isPending}
        >
          Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
}
