import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Wallet,
  BarChart3,
} from "lucide-react";

export const BUSINESS_NAV = [
  { href: "/business", label: "Overview", icon: LayoutDashboard },
  { href: "/business/properties", label: "Properties", icon: Building2 },
  { href: "/business/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/business/payouts", label: "Earnings", icon: Wallet },
  { href: "/business#analytics", label: "Analytics", icon: BarChart3 },
];
