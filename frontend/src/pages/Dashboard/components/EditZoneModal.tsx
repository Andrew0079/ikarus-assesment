import { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "baseui/modal";
import { Button } from "baseui/button";
import { FormControl } from "baseui/form-control";
import { Input } from "baseui/input";
import { useUpdateZoneMutation } from "../../../shared/api/queries/use-zones";
import { useAppDispatch, addToast } from "../../../shared/redux";
import type { Zone } from "../../../shared/api/types";

interface EditZoneModalProps {
  zone: Zone | null;
  onClose: () => void;
}

export function EditZoneModal({ zone, onClose }: EditZoneModalProps) {
  const [name, setName] = useState("");
  const updateMutation = useUpdateZoneMutation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (zone) setName(zone.name);
  }, [zone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zone || !name.trim()) return;
    try {
      await updateMutation.mutateAsync({ zoneId: zone.id, body: { name: name.trim() } });
      dispatch(addToast({ type: "success", message: "Zone updated" }));
      onClose();
    } catch {
      // Error toast from mutation default
    }
  };

  const isOpen = Boolean(zone);

  return (
    <Modal isOpen={isOpen} onClose={() => onClose()} closeable>
      <form onSubmit={handleSubmit}>
        <ModalHeader>Edit zone</ModalHeader>
        <ModalBody>
          <FormControl label="Name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Zone name"
              disabled={updateMutation.isPending}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button kind="tertiary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={updateMutation.isPending} disabled={!name.trim()}>
            Save
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
