import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { FileText, Search } from 'lucide-react-native';
import StudentTicketForm from './screens/StudentTicketForm';
import TrackTicket from './screens/TrackTicket';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 0,
            elevation: 8,
            shadowColor: '#7c3aed',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8
          },
          tabBarActiveTintColor: '#7c3aed',
          tabBarInactiveTintColor: '#94a3b8',
          headerShown: false
        }}
      >
        <Tab.Screen
          name="CreateTicket"
          component={StudentTicketForm}
          options={{
            title: 'Buat Tiket',
            tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />
          }}
        />
        <Tab.Screen
          name="TrackTicket"
          component={TrackTicket}
          options={{
            title: 'Lacak Tiket',
            tabBarIcon: ({ color, size }) => <Search color={color} size={size} />
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}