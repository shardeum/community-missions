pragma solidity 0.8.4;
contract Calculator {

    function computeStringExpression(string memory str) pure public returns(int){
         bytes memory strBytes = bytes(str);
         int num=0;
         int op=-95;
         int element;
         int[] memory stack;
         for(uint i=0;i<strBytes.length;i++)
         { if(isNumber(strBytes[i])){
             num=num*10+byteToInt(strBytes[i]);
         }
         else if(convert(strBytes[i])==-99){
             stack=push(stack,op);
             op=-95;
             

         }
         else if(convert(strBytes[i])==-95 || convert(strBytes[i])==-96 || convert(strBytes[i])==-97 || convert(strBytes[i])==-98||convert(strBytes[i])==-100)
         {
             stack=helper(stack,num,op);
             if(convert(strBytes[i])==-100)
             {
                 num=0;
                while(stack[stack.length-1]!=-95 && stack[stack.length-1]!=-96 && stack[stack.length-1]!=-97 && stack[stack.length-1]!=-98 &&  stack[stack.length-1]!=-99 &&  stack[stack.length-1]!=-100)
                 {
                    (element,stack)=pop(stack);
                    num+=element;
                    
                
                }
                (op,stack)=pop(stack);
                
                stack=helper(stack,num,op);
             }
         num=0;
          op=convert(strBytes[i]) ;

         } 
         }
        stack=helper(stack,num,op);
         return calculateSum(stack);

     }

    //  function helper()
     function isNumber(bytes1 byteValue) public pure returns (bool) {
        if (byteValue >= 0x30 && byteValue <= 0x39) {
            return true;
        }
        return false;
    }
        
  function byteToInt(bytes1 byteValue) public pure returns (int256) {
        require(byteValue >= 0x30 && byteValue <= 0x39, "Not a valid decimal digit");
        return int256(int8(uint8(byteValue)) - int8(0x30));
    }

    function convert(bytes1 value) public pure returns (int256){
        if(value=="+"){
            return -95;

        }
        else if(value=="-")
        {
            return -96;
        }else if(value=="*"){
            return -97;
        }else if(value=="/"){
            return -98;
        }else if(value=="("){
            return -99;
        }
        else if(value==")"){
            return -100;
        }
    }

    function bytesarray(bytes memory array) public pure returns(bytes[10] memory) {
        bytes[10] memory array1;
        array1[0]=array;
        return array1;
    }

    function helper(int[] memory stack,int num,int op) public pure returns(int[] memory ){
        int element;
       if(op==-95){
           stack=push(stack,num);
       }else if(op==-96){
            stack=push(stack,-num);
       }else if(op==-97){
           
          (element,stack)=pop(stack);
           stack=push(stack,element*num);
       }else if(op==-98){
           
            ( element,stack)=pop(stack);
           stack=push(stack,element/num);
       }
       return stack;
    }

     function push(int[] memory array, int element) public pure returns (int[] memory) {
        int[] memory newArray = new int[](array.length + 1);
        
        for (uint i = 0; i < array.length; i++) {
            newArray[i] = array[i];
        }
        
        newArray[array.length] = element;
        
        return newArray;
    }
    
    function pop(int[] memory array) public pure returns (int, int[] memory) {
        require(array.length > 0, "Array is empty");
        
        int lastElement = array[array.length - 1];
        
        int[] memory resizedArray = new int[](array.length - 1);
        for (uint i = 0; i < array.length - 1; i++) {
            resizedArray[i] = array[i];
        }
        
        return (lastElement, resizedArray);
    }

    function calculateSum(int[] memory array) public pure returns (int) {
        int sum = 0;
        
        for (uint i = 0; i < array.length; i++) {
            sum += array[i];
        }
        
        return sum;
    }

}
