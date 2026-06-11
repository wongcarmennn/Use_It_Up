import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PantryStackParams } from '../navigation/AppNavigator';
import { COLORS, RADIUS, TYPOGRAPHY } from '../theme';

type Nav = NativeStackNavigationProp<PantryStackParams, 'Scanner'>;

async function lookupBarcode(barcode: string): Promise<{ product_name?: string } | null> {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const json = await res.json();
    return json.status === 1 ? json.product : null;
  } catch { return null; }
}

export default function ScannerScreen() {
  const navigation = useNavigation<Nav>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!permission?.granted) requestPermission(); }, []);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    const product = await lookupBarcode(data);
    if (product?.product_name) {
      navigation.replace('AddItem', { barcode: data, productName: product.product_name });
    } else {
      Alert.alert('Product not found', 'We couldn\'t find this barcode. You can still add it manually.', [
        { text: 'Add Manually', onPress: () => navigation.replace('AddItem', { barcode: data }) },
        { text: 'Scan Again', onPress: () => { setScanned(false); setLoading(false); } },
      ]);
    }
    setLoading(false);
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>UseItUp needs camera access to scan barcodes.</Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
          <Text style={styles.grantBtnText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.topDim} />
        <View style={styles.middleRow}>
          <View style={styles.sideDim} />
          <View style={styles.scanWindow}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>
          <View style={styles.sideDim} />
        </View>
        <View style={styles.bottomDim}>
          {loading ? <ActivityIndicator size="large" color={COLORS.white} /> : <Text style={styles.hint}>Point at a barcode to scan</Text>}
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const WINDOW_SIZE = 260;
const DIM = 'rgba(0,0,0,0.6)';
const CS = 28, CT = 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject },
  topDim: { flex: 1, backgroundColor: DIM },
  middleRow: { flexDirection: 'row', height: WINDOW_SIZE },
  sideDim: { flex: 1, backgroundColor: DIM },
  scanWindow: { width: WINDOW_SIZE, height: WINDOW_SIZE, position: 'relative' },
  bottomDim: { flex: 1, backgroundColor: DIM, alignItems: 'center', justifyContent: 'center', gap: 20 },
  hint: { color: COLORS.white, ...TYPOGRAPHY.body, textAlign: 'center' },
  corner: { position: 'absolute', width: CS, height: CS, borderColor: COLORS.primary },
  tl: { top: 0, left: 0, borderTopWidth: CT, borderLeftWidth: CT },
  tr: { top: 0, right: 0, borderTopWidth: CT, borderRightWidth: CT },
  bl: { bottom: 0, left: 0, borderBottomWidth: CT, borderLeftWidth: CT },
  br: { bottom: 0, right: 0, borderBottomWidth: CT, borderRightWidth: CT },
  cancelBtn: { paddingHorizontal: 32, paddingVertical: 12, borderRadius: RADIUS.xl, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  cancelBtnText: { color: COLORS.white, ...TYPOGRAPHY.body, fontWeight: '600' },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12, backgroundColor: COLORS.white },
  permissionEmoji: { fontSize: 56 },
  permissionTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, textAlign: 'center' },
  permissionText: { ...TYPOGRAPHY.body, color: COLORS.gray, textAlign: 'center' },
  grantBtn: { marginTop: 8, backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: RADIUS.md },
  grantBtnText: { color: COLORS.white, ...TYPOGRAPHY.h3 },
});
