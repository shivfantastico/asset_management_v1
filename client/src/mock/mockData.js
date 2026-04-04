/* Mock Data - Replace with real Axios API calls when backend is ready */

export const mockStats = {
  totalUsers: 142,
  totalAssets: 318,
  assetsByType: { pc: 189, printer: 74, gsmphone: 38, tablet: 17 },
}

export const mockRecentActivity = [
  { id: 1, asset_code: 'PC-2024-001', asset_type: 'Laptop', model_name: 'Dell Latitude 5540', user: 'Rahul Sharma', department: 'IT', handover_date: '2024-03-10', status: 'Active' },
  { id: 2, asset_code: 'PR-2024-012', asset_type: 'Printer', model_name: 'HP LaserJet Pro', user: 'Priya Mehta', department: 'Finance', handover_date: '2024-03-08', status: 'Active' },
  { id: 3, asset_code: 'PC-2024-045', asset_type: 'Desktop', model_name: 'HP ProDesk 400', user: 'Amit Verma', department: 'HR', handover_date: '2024-03-05', status: 'Active' },
  { id: 4, asset_code: 'PC-2023-178', asset_type: 'Laptop', model_name: 'Lenovo ThinkPad E15', user: 'Sneha Patil', department: 'Sales', handover_date: '2024-02-28', status: 'Returned' },
  { id: 5, asset_code: 'PR-2024-007', asset_type: 'Printer', model_name: 'Canon LBP6030', user: 'Admin Desk', department: 'Admin', handover_date: '2024-02-20', status: 'Active' },
]

export const mockAssets = [
  { id: 1, asset_code: 'PC-2024-001', category: 'pc', asset_type: 'laptop', model_name: 'Dell Latitude 5540', serial_number: 'DL5540-XYZ123', ram: '16 GB', storage: '512 GB SSD', has_antivirus: true, user_verified: true, handover_date: '2024-03-10', department: 'IT', assigned_to: 'Rahul Sharma' },
  { id: 2, asset_code: 'PC-2024-002', category: 'pc', asset_type: 'desktop', model_name: 'HP ProDesk 400 G9', serial_number: 'HPD400-ABC456', ram: '8 GB', storage: '256 GB SSD', has_antivirus: true, user_verified: false, handover_date: '2024-03-09', department: 'Finance', assigned_to: 'Priya Mehta' },
  { id: 3, asset_code: 'PC-2024-003', category: 'pc', asset_type: 'laptop', model_name: 'Lenovo ThinkPad E15', serial_number: 'LTP15-DEF789', ram: '16 GB', storage: '1 TB SSD', has_antivirus: false, user_verified: true, handover_date: '2024-03-07', department: 'HR', assigned_to: 'Amit Verma' },
  { id: 4, asset_code: 'PR-2024-001', category: 'printer', asset_type: 'printer', model_name: 'HP LaserJet Pro M404dn', serial_number: 'HPLJ-GHI012', make: 'HP', deployed_location: 'Floor 2 - Finance', user_verified: true, handover_date: '2024-03-06', department: 'Finance', assigned_to: 'Finance Dept' },
  { id: 5, asset_code: 'PR-2024-002', category: 'printer', asset_type: 'printer', model_name: 'Canon imageRUNNER', serial_number: 'CNIR-JKL345', make: 'Canon', deployed_location: 'Reception', user_verified: false, handover_date: '2024-03-01', department: 'Admin', assigned_to: 'Reception Desk' },
  { id: 6, asset_code: 'PC-2024-004', category: 'pc', asset_type: 'laptop', model_name: 'Dell Inspiron 15', serial_number: 'DI15-MNO678', ram: '8 GB', storage: '512 GB HDD', has_antivirus: true, user_verified: true, handover_date: '2024-02-28', department: 'Sales', assigned_to: 'Sneha Patil' },
]

export const mockUsers = [
  { id: 1, emp_id: 'EMP001', name: 'Rahul Sharma', department: 'IT', asset_pc: true, email: 'rahul.sharma@company.com' },
  { id: 2, emp_id: 'EMP002', name: 'Priya Mehta', department: 'Finance', asset_pc: true, email: 'priya.mehta@company.com' },
  { id: 3, emp_id: 'EMP003', name: 'Amit Verma', department: 'HR', asset_pc: false, email: 'amit.verma@company.com' },
  { id: 4, emp_id: 'EMP004', name: 'Sneha Patil', department: 'Sales', asset_pc: true, email: 'sneha.patil@company.com' },
  { id: 5, emp_id: 'EMP005', name: 'Karan Singh', department: 'Operations', asset_pc: false, email: 'karan.singh@company.com' },
  { id: 6, emp_id: 'EMP006', name: 'Divya Nair', department: 'Marketing', asset_pc: true, email: 'divya.nair@company.com' },
]
