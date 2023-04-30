//@ts-nocheck
import {
  Box,
  Button,
  Code,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";

export const SourceCodeModal = ({ source }) => {
  const size = useBreakpointValue({ base: "full", lg: "xl" });
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box>
      <Button onClick={onOpen}>Show code</Button>
      <Modal
        size={size}
        isCentered
        onClose={onClose}
        isOpen={isOpen}
        motionPreset="scale"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Source Code</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Code
              display="flex"
              whiteSpace="pre"
              overflow="scroll"
              textAlign="left"
            >
              {source}
            </Code>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
