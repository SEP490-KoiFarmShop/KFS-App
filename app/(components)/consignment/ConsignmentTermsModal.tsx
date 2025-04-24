import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";

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
        <View className="bg-white p-6 rounded-lg w-4/5 max-h-5/6">
          <Text className="text-xl font-bold mb-4 text-center">
            GIẤY ỦY QUYỀN
          </Text>

          <ScrollView className="max-h-4/5">
            <View className="section mb-4">
              <Text className="text-lg font-bold mb-2">NỘI DUNG UỶ QUYỀN</Text>
              <Text className="mb-2">
                Bên Uỷ quyền đồng ý ủy quyền cho Bên Nhận Ủy quyền thực hiện các
                hành vi sau đây:
              </Text>
              <View className="ml-4">
                <Text className="mb-1">
                  • Tiếp nhận, định đoạt và định giả tài phẩm từ cá Koi do Bên
                  Uỷ quyền gửi.
                </Text>
                <Text className="mb-1">
                  • Được phép kiểm tra và nhận vật phẩm nêu trên khi hoàn thành
                  thủ tục bán/đấu giá.
                </Text>
                <Text className="mb-1">
                  • Nhận tiền hoàn lại từ việc bán/đấu giá.
                </Text>
                <Text className="mb-1">
                  • Thay mặt bên uỷ quyền thực hiện, giám sát toàn bộ thủ tục
                  bàn giao vật phẩm.
                </Text>
              </View>
              <Text className="text-lg font-bold mb-2">CAM KẾT</Text>
              <Text className="mb-2">
                - Hai bên cam kết sẽ hoàn toàn chịu trách nhiệm trước Pháp luật
                về mọi thông tin uỷ quyền ở trên
              </Text>
              <Text className="mb-2">
                - Mọi tranh chấp phát sinh giữa quyền uỷ quyền và bên được uỷ
                quyền sẽ do hai bên tự giải quyết
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            className="mt-4 p-3 bg-blue-500 rounded-lg"
          >
            <Text className="text-white font-medium text-center">Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ConsignmentTermsModal;
