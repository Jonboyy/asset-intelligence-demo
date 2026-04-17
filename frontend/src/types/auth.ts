export type DemoUserRole =
  | "asset_manager"
  | "it_manager"
  | "operations_manager"

export interface DemoUser {
  name: string
  email: string
  password: string
  role: DemoUserRole
  title: string
}