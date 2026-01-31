import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Rover",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
