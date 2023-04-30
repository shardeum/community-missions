//@ts-nocheck
import { HStack, Input, StackProps, VStack } from "@chakra-ui/react";

export type MagicSquareProps = {
  values: string[][];
  onValueChange: (row: number, cell: number, value: string) => void;
};

export const MagicSquare = (props: MagicSquareProps & StackProps) => {
  const { values, onValueChange, ...stackProps } = props;
  return (
    <VStack w="200px" {...stackProps}>
      {values.map((row, r) => (
        <HStack key={r}>
          {row.map((value, c) => (
            <Input
              key={`${r}-${c}`}
              type="number"
              size="lg"
              fontWeight="bold"
              textAlign="center"
              value={value ?? ""}
              onChange={(e) => onValueChange(r, c, e.currentTarget.value)}
              max={100}
              required={true}
            />
          ))}
        </HStack>
      ))}
    </VStack>
  );
};
