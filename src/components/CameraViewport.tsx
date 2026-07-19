// import React from 'react';
// import { StyleSheet, View, ImageBackground, ImageSourcePropType } from 'react-native';
// import { Colors } from '../constants/Colors';

// interface CameraViewportProps {
//   imageSource?: ImageSourcePropType;
//   children?: React.ReactNode;
// }

// export const CameraViewport = ({
//   imageSource = { uri: 'https://cdn3.ivivu.com/2026/03/du-lich-da-lat-ivivu.jpg' },
//   children,
// }: CameraViewportProps): React.JSX.Element => {
//   return (
   
//       <ImageBackground
//         source={imageSource}
//         style={styles.imageBackground}
//         imageStyle={styles.imageStyle}
//         resizeMode="cover"
//       >
//         {children}
//       </ImageBackground>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   previewContainer: {
//     width: '100%',
//     aspectRatio: 3 / 4,
//     borderRadius: 36,
//     borderWidth: 2,
//     borderColor: Colors.primary,
//     overflow: 'hidden',
//     marginTop: 8,
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.45,
//     shadowRadius: 15,
//     elevation: 8,
//   },
//   imageBackground: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'space-between',
//   },
//   imageStyle: {
//     borderRadius: 34,
//   },
// });
