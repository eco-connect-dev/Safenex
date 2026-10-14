import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import {
  AlertsScreen,
  EvidenceScreen,
  HazardTypeScreen,
  HomeScreen,
  IncidentDetailsScreen,
  LocationScreen,
  ProfileScreen,
  ReportsScreen,
  ReviewScreen,
  SubmittedScreen,
} from "@/src/features/hazard-reporting/screens/MobileScreens";

export type MobileRootStackParamList = {
  MobileHome: undefined;
  HazardType: undefined;
  IncidentDetails: undefined;
  Evidence: undefined;
  Location: undefined;
  ReviewReport: undefined;
  Submitted: undefined;
  MyReports: undefined;
  Alerts: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<MobileRootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen component={HomeScreen} name="MobileHome" />
        <Stack.Screen component={HazardTypeScreen} name="HazardType" />
        <Stack.Screen
          component={IncidentDetailsScreen}
          name="IncidentDetails"
        />
        <Stack.Screen component={EvidenceScreen} name="Evidence" />
        <Stack.Screen component={LocationScreen} name="Location" />
        <Stack.Screen component={ReviewScreen} name="ReviewReport" />
        <Stack.Screen component={SubmittedScreen} name="Submitted" />
        <Stack.Screen component={ReportsScreen} name="MyReports" />
        <Stack.Screen component={AlertsScreen} name="Alerts" />
        <Stack.Screen component={ProfileScreen} name="Profile" />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
