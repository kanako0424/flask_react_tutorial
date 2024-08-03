import {
	Button,
	Flex,
	FormControl,
	FormLabel,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Radio,
	RadioGroup,
	Textarea,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { useState ,useContext } from "react";
import { BiAddToQueue } from "react-icons/bi";
import { BASE_URL, CurrentUserContext } from "../App.jsx";
import PropTypes from 'prop-types';


const CreateUserModal = ({ setUsers }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [isLoading, setIsLoading] = useState(false);
	const [inputs, setInputs] = useState({
		name: "",
		role: "",
		description: "",
		gender: "",
	});
	const toast = useToast();
	const currentUser = useContext(CurrentUserContext);





	const handleCreateUser = async (e) => {
		e.preventDefault(); // prevent page refresh
		setIsLoading(true);
		try {
			const res = await fetch(BASE_URL + "/friends", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...inputs,
					creatorId: currentUser.userId,
				}),
			});

			const resData = await res.json();

			if (!res.ok) {
				throw new Error(resData.error);
			}

			toast({
				status: "success",
				title: "イェイ! 🎉",
				description: "友達情報を登録できました！",
				duration: 2000,
				position: "top-center",
			});
			onClose();
			setUsers((prevUsers) => [...prevUsers, resData]);

			setInputs({
				name: "",
				role: "",
				description: "",
				gender: "",
			}); // clear inputs
		} catch (error) {
			toast({
				status: "error",
				title: "友達情報の登録中にエラーが起きました",
				description: error.message,
				duration: 4000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Button onClick={onOpen}>
				<BiAddToQueue size={20} />
			</Button>

			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<form onSubmit={handleCreateUser}>
					<ModalContent>
						<ModalHeader> 私の友達 😍 </ModalHeader>
						<ModalCloseButton />

						<ModalBody pb={6}>
							<Flex alignItems={"center"} gap={4}>
								{/* Left */}
								<FormControl>
									<FormLabel>フルネーム</FormLabel>
									<Input
										placeholder='田中　太郎'
										value={inputs.name}
										onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
									/>
								</FormControl>

								{/* Right */}
								<FormControl>
									<FormLabel>肩書き</FormLabel>
									<Input
										placeholder='エンジニア'
										value={inputs.role}
										onChange={(e) => setInputs({ ...inputs, role: e.target.value })}
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
									onChange={(e) => setInputs({ ...inputs, description: e.target.value })}
								/>
							</FormControl>

							<RadioGroup mt={4}>
								<Flex gap={5}>
									<Radio
										value='male'
										onChange={(e) => setInputs({ ...inputs, gender: e.target.value })}
									>
										男性
									</Radio>
									<Radio
										value='female'
										onChange={(e) => setInputs({ ...inputs, gender: e.target.value })}
									>
										女性
									</Radio>
								</Flex>
							</RadioGroup>
						</ModalBody>

						<ModalFooter>
							<Button colorScheme='blue' mr={3} type='submit' isLoading={isLoading}>
								追加
							</Button>
							<Button onClick={onClose}>キャンセル</Button>
						</ModalFooter>
					</ModalContent>
				</form>
			</Modal>
		</>
	);
};

CreateUserModal.propTypes = {
	setUsers: PropTypes.func,
	user: PropTypes.shape({
		id: PropTypes.number.isRequired,
		name: PropTypes.string.isRequired,
		role: PropTypes.string.isRequired,
		description: PropTypes.string,
	}),
  };

export default CreateUserModal;