import * as React from "react";
import { Image } from "expo-image";
import { StyleSheet, Text, Pressable, View } from "react-native";
import { FontSize, FontFamily, Color, Padding } from "../GlobalStyles";

const Header = ({ ordenes, onUserIconPress }) => {
  return (
    <View style={styles.header}>
      <Image
        style={styles.logoCentralRemovebgPreviewIcon}
        contentFit="cover"
        source={require("../assets/logo-centralremovebgpreview-1.png")}
      />
      <Text style={styles.ordenes} numberOfLines={1}>
        {ordenes}
      </Text>
      <Pressable style={styles.userIcon} onPress={onUserIconPress}>
        <Image
          style={styles.frameIcon}
          contentFit="cover"
          source={require("../assets/frame.png")}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  logoCentralRemovebgPreviewIcon: {
    width: 58,
    height: 41,
  },
  ordenes: {
    flex: 1,
    fontSize: FontSize.size_5xl,
    letterSpacing: -0.4,
    lineHeight: 40,
    fontWeight: "700",
    fontFamily: FontFamily.montserratBold,
    color: Color.colorGray,
    textAlign: "center",
    overflow: "hidden",
  },
  frameIcon: {
    width: 47,
    height: 31,
    overflow: "hidden",
  },
  userIcon: {
    display: "none",
    height: 41,
    flexDirection: "row",
  },
  header: {
    alignSelf: "stretch",
    backgroundColor: "#FFC300",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Padding.p_base,
    paddingTop: Padding.p_11xl,
    paddingBottom: Padding.p_base,
    flexDirection: "row",
  },
});

export default Header;
