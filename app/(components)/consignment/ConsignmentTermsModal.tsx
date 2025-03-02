import { View, Text, Modal, TouchableOpacity } from "react-native";

interface ConsignmentTermsModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

const ConsignmentTermsModal: React.FC<ConsignmentTermsModalProps> = ({
  modalVisible,
  setModalVisible,
}) => {
  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-white p-6 rounded-lg w-4/5">
          <Text className="text-lg font-bold mb-2">Terms of Use</Text>
          <Text className="text-gray-600">
            Đây là nội dung điều khoản sử dụng...
          </Text>
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            className="mt-4 p-2 bg-blue-500 rounded text-center"
          >
            <Text className="text-white text-center">Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ConsignmentTermsModal;
