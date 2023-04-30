//@ts-nocheck
import { chakra, Container } from "@chakra-ui/react";

export const MainContainer = chakra(Container, {
  baseStyle: {
    bg: "gray.50",
    color: "black",
    _dark: {
      bg: "gray.900",
      color: "white",
    },
    transition: "all 0.15s ease-out",
  },
});
