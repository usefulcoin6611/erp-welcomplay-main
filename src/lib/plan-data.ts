export type PlanData = {
  id: string
  name: string
  price: number
  duration: 'lifetime' | 'month' | 'year'
  max_users: number
  max_customers: number
  max_venders: number
  max_clients: number
  storage_limit: number
  trial_days: number
  is_disable: boolean
  account: boolean
  crm: boolean
  hrm: boolean
  project: boolean
  pos: boolean
  chatgpt: boolean
}

export const PLAN_DATA: PlanData[] = [
  {
    id: '1',
    name: 'Free Plan',
    price: 0,
    duration: 'lifetime',
    max_users: 5,
    max_customers: 5,
    max_venders: 5,
    max_clients: 5,
    storage_limit: 1024,
    trial_days: 0,
    is_disable: true,
    account: true,
    crm: true,
    hrm: true,
    project: true,
    pos: true,
    chatgpt: true,
  },
  {
    id: '2',
    name: 'Silver',
    price: 250000,
    duration: 'month',
    max_users: 20,
    max_customers: 100,
    max_venders: 50,
    max_clients: 25,
    storage_limit: 5000,
    trial_days: 7,
    is_disable: true,
    account: true,
    crm: true,
    hrm: true,
    project: false,
    pos: false,
    chatgpt: false,
  },
  {
    id: '3',
    name: 'Gold',
    price: 750000,
    duration: 'month',
    max_users: 50,
    max_customers: 500,
    max_venders: 100,
    max_clients: 50,
    storage_limit: 10000,
    trial_days: 14,
    is_disable: true,
    account: true,
    crm: true,
    hrm: true,
    project: true,
    pos: true,
    chatgpt: false,
  },
  {
    id: '4',
    name: 'Platinum',
    price: 1500000,
    duration: 'month',
    max_users: -1,
    max_customers: -1,
    max_venders: -1,
    max_clients: -1,
    storage_limit: -1,
    trial_days: 30,
    is_disable: true,
    account: true,
    crm: true,
    hrm: true,
    project: true,
    pos: true,
    chatgpt: true,
  },
]
