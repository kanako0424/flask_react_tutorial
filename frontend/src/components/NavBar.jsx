import { Box, Container, Flex, Text } from "@chakra-ui/react"

function NavBar() {
    const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Container maxW={"900px"}>
        <Box px={4} my={4} borderRadius={5} bg={useColorModeValue("gray.200", "gray.700")}>

            <Flex 
                h={"16"}
                alignItems={"center"}
                justifyContent={"space-between"}
            >
                <Flex
                    alignItems={"center"}
                    justifyContent={"center"}
                    gap={3}
                    display={{base:"none", sm:"flex"}}
                >
                    <img src="/react.png" alt="React Logo" width={50} height={50}/>
                    <Text fontSize={"40px"}>+</Text>
                    <img src="/python.png" alt="Python Logo" width={50} height={40}/>
                    <Text fontSize={"40px"}>=</Text>
                    <img src="/explode.png" alt="Explode head" width={45} height={45}/>

                </Flex>

                <Flex gap={3} alignItems={"center"}>
                    <Text fontSize={"lg"} fontWeight={} ></Text>
                </Flex>

            </Flex>

        </Box>
    </Container>
  )
}

export default NavBar