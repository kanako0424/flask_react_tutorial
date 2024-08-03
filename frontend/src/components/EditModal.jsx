import {
	Button,
	Flex,
	FormControl,
	FormLabel,
	IconButton,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Textarea,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { useState, useContext } from "react";
import { BiEditAlt } from "react-icons/bi";
import { BASE_URL, CurrentUserContext } from "../App.jsx";
import PropTypes from 'prop-types';


function EditModal({ setUsers, user }) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [isLoading, setIsLoading] = useState(false);
	const [inputs, setInputs] = useState({
		name: user.name,
		role: user.role,
		description: user.description,
	});
	const toast = useToast();
	const currentUser = useContext(CurrentUserContext);


	const handleEditUser = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const res = await fetch(BASE_URL + "/friends/" + user.id, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(inputs),
			});
			const resData = await res.json();
			if (!res.ok) {
				throw new Error(resData.error);
			}
			setUsers((prevUsers) => prevUsers.map((u) => (u.id === user.id ? resData : u)));
			toast({
				status: "success",
				title: "イェイ! 🎉",
				description: "友達情報を更新できました！",
				duration: 2000,
				position: "top-center",
			});
			onClose();
		} catch (error) {
			toast({
				status: "error",
				title: "友達情報の更新中にエラーが起きました",
				description: error.message,
				duration: 4000,
				position: "top-center",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>    
		<CurrentUserContext.Provider value={currentUser}>
			{currentUser && currentUser.userId === user.creatorId && (
				<IconButton
					onClick={onOpen}
					variant='ghost'
					colorScheme='blue'
					aria-label='See menu'
					size={"sm"}
					icon={<BiEditAlt size={20} />}
				/>
			)}
		</CurrentUserContext.Provider>


			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<form onSubmit={handleEditUser}>
					<ModalContent>
						<ModalHeader>私の友達 😍</ModalHeader>
						<ModalCloseButton />
						<ModalBody pb={6}>
							<Flex alignItems={"center"} gap={4}>
								<FormControl>
									<FormLabel>フルネーム</FormLabel>
									<Input
										placeholder='田中　太郎'
										value={inputs.name}
										onChange={(e) => setInputs((prev) => ({ ...prev, name: e.target.value }))}
									/>
								</FormControl>

								<FormControl>
									<FormLabel>役割</FormLabel>
									<Input
										placeholder='エンジニア'
										value={inputs.role}
										onChange={(e) => setInputs((prev) => ({ ...prev, role: e.target.value }))}
									/>
								</FormControl>
							</Flex>
							<FormControl mt={4}>
								<FormLabel>説明</FormLabel>
								<Textarea
									resize={"none"}
									overflowY={"hidden"}
									placeholder="彼はGoogleのエンジニアで、物作りが好き。"
									value={inputs.description}
									onChange={(e) => setInputs((prev) => ({ ...prev, description: e.target.value }))}
								/>
							</FormControl>
						</ModalBody>

						<ModalFooter>
							<Button colorScheme='blue' mr={3} type='submit' isLoading={isLoading}>
								更新
							</Button>
							<Button onClick={onClose}>キャンセル</Button>
						</ModalFooter>
					</ModalContent>
				</form>
			</Modal>
		</>
	);
}

EditModal.propTypes = {
	setUsers: PropTypes.func.isRequired,
	user: PropTypes.shape({
		id: PropTypes.number.isRequired,
		name: PropTypes.string.isRequired,
		role: PropTypes.string.isRequired,
		description: PropTypes.string,
		creatorId: PropTypes.string
	}).isRequired,
  };

export default EditModal;

// STARTER CODE
// import {
// 	Button,
// 	Flex,
// 	FormControl,
// 	FormLabel,
// 	IconButton,
// 	Input,
// 	Modal,
// 	ModalBody,
// 	ModalCloseButton,
// 	ModalContent,
// 	ModalFooter,
// 	ModalHeader,
// 	ModalOverlay,
// 	Radio,
// 	RadioGroup,
// 	Textarea,
// 	useDisclosure,
// } from "@chakra-ui/react";
// import { BiEditAlt } from "react-icons/bi";

// function EditModal({ user }) {
// 	const { isOpen, onOpen, onClose } = useDisclosure();

// 	return (
// 		<>
// 			<IconButton
// 				onClick={onOpen}
// 				variant='ghost'
// 				colorScheme='blue'
// 				aria-label='See menu'
// 				size={"sm"}
// 				icon={<BiEditAlt size={20} />}
// 			/>

// 			<Modal isOpen={isOpen} onClose={onClose}>
// 				<ModalOverlay />
// 				<ModalContent>
// 					<ModalHeader>My new BFF 😍</ModalHeader>
// 					<ModalCloseButton />
// 					<ModalBody pb={6}>
// 						<Flex alignItems={"center"} gap={4}>
// 							<FormControl>
// 								<FormLabel>Full Name</FormLabel>
// 								<Input placeholder='John Doe' />
// 							</FormControl>

// 							<FormControl>
// 								<FormLabel>Role</FormLabel>
// 								<Input placeholder='Software Engineer' />
// 							</FormControl>
// 						</Flex>
// 						<FormControl mt={4}>
// 							<FormLabel>Description</FormLabel>
// 							<Textarea
// 								resize={"none"}
// 								overflowY={"hidden"}
// 								placeholder="He's a software engineer who loves to code and build things.
//               "
// 							/>
// 						</FormControl>
// 						<RadioGroup defaultValue='male' mt={4}>
// 							<Flex gap={5}>
// 								<Radio value='male'>Male</Radio>
// 								<Radio value='female'>Female</Radio>
// 							</Flex>
// 						</RadioGroup>
// 					</ModalBody>

// 					<ModalFooter>
// 						<Button colorScheme='blue' mr={3}>
// 							Add
// 						</Button>
// 						<Button onClick={onClose}>Cancel</Button>
// 					</ModalFooter>
// 				</ModalContent>
// 			</Modal>
// 		</>
// 	);
// }

// export default EditModal;