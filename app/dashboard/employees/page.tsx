"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Employee, ApiResponse } from "@/types";
import { UserPlus, Upload, Send, AlertCircle, CheckCircle } from "lucide-react";
import { getEmployees, addEmployee, bulkUploadEmployees, sendNotification, ApiError } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'auth' | 'server' | 'network'>('network');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Add employee form state
  const [addEmployeeForm, setAddEmployeeForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    employee_identifier: "",
    password: "",
  });
  const [addEmployeeLoading, setAddEmployeeLoading] = useState(false);
  const [addEmployeeError, setAddEmployeeError] = useState<string | null>(null);
  const [addEmployeeValidationErrors, setAddEmployeeValidationErrors] = useState<Record<string, string[]>>({});
  const [addEmployeeSuccess, setAddEmployeeSuccess] = useState(false);
  const [addEmployeeResponseData, setAddEmployeeResponseData] = useState<Record<string, unknown> | null>(null);

  // Bulk upload state
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);

  // Notification state
  const [notifySubject, setNotifySubject] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyRecipients, setNotifyRecipients] = useState("all");
  const [notifySending, setNotifySending] = useState(false);
  const [notifyError, setNotifyError] = useState<string | null>(null);
  const [notifySuccess, setNotifySuccess] = useState<string | null>(null);

  async function fetchEmployees() {
    try {
      setLoading(true);
      setError(null);
      const response = await getEmployees({ page: currentPage }) as ApiResponse<Employee[]> & { total?: number };

      if (response?.success && response.data) {
        // API returns { success: true, data: [...], total: 250 }
        setEmployees(Array.isArray(response.data) ? response.data : []);
        // Calculate total pages if we have a total count (assuming 10 per page)
        const total = response.total || 0;
        setTotalPages(Math.ceil(total / 10));
        setError(null);
      } else {
        setEmployees([]);
        setError(response?.message || "Failed to load employees");
        setErrorType('server');
      }
    } catch (err: unknown) {
      console.error("Error fetching employees:", err);
      const message = err instanceof Error ? err.message : String(err);

      if (err instanceof ApiError) {
        if (err.status === 401) {
          setErrorType('auth');
          setError('You need to login to view employees');
        } else if (err.status >= 500) {
          setErrorType('server');
          setError(err.message);
        } else {
          setErrorType('network');
          setError(err.message || "Failed to fetch employees");
        }
      } else {
        setErrorType('network');
        setError(message || "Failed to fetch employees");
      }

      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddEmployeeLoading(true);
    setAddEmployeeError(null);
    setAddEmployeeValidationErrors({});
    setAddEmployeeSuccess(false);

    try {
      const payload = {
        firstname: addEmployeeForm.firstname,
        lastname: addEmployeeForm.lastname,
        email: addEmployeeForm.email,
        ...(addEmployeeForm.phone.trim() ? { phone: addEmployeeForm.phone } : {}),
        ...(addEmployeeForm.employee_identifier.trim()
          ? { employee_identifier: addEmployeeForm.employee_identifier }
          : {}),
        ...(addEmployeeForm.password.trim() ? { password: addEmployeeForm.password } : {}),
      };

      const response = await addEmployee(payload) as ApiResponse<Employee>;

      if (response.success) {
        setAddEmployeeSuccess(true);
        setAddEmployeeResponseData((response.data as unknown as Record<string, unknown>) ?? null);
        // Reset form
        setAddEmployeeForm({
          firstname: "",
          lastname: "",
          email: "",
          phone: "",
          employee_identifier: "",
          password: "",
        });
        // Refresh employee list
        const employeesResponse = await getEmployees({ page: currentPage }) as ApiResponse<Employee[]> & { total?: number };
        if (employeesResponse.success && employeesResponse.data) {
          setEmployees(Array.isArray(employeesResponse.data) ? employeesResponse.data : []);
          const total = employeesResponse.total || 0;
          setTotalPages(Math.ceil(total / 10));
        }
      } else {
        setAddEmployeeError(response.message || "Failed to add employee");
        if (response.errors) {
          setAddEmployeeValidationErrors(response.errors);
        }
      }
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setAddEmployeeError(error.message || "Failed to add employee");
        if (error.data?.errors) {
          setAddEmployeeValidationErrors(error.data.errors);
        }
      } else {
        setAddEmployeeError(error instanceof Error ? error.message : "Failed to add employee");
      }
    } finally {
      setAddEmployeeLoading(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setAddEmployeeForm(prev => ({ ...prev, [field]: value }));
    setAddEmployeeError(null);
    setAddEmployeeValidationErrors({});
    setAddEmployeeSuccess(false);
    setAddEmployeeResponseData(null);
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      setBulkError("Please select a CSV file");
      return;
    }
    setBulkUploading(true);
    setBulkError(null);
    setBulkSuccess(null);
    try {
      const response = await bulkUploadEmployees(bulkFile) as ApiResponse<{ created?: number }>;
      if (response.success) {
        setBulkSuccess(response.message || `Successfully uploaded ${response.data?.created || 0} employees`);
        setBulkFile(null);
        // Reset file input
        const fileInput = document.getElementById("csvUpload") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        fetchEmployees();
      } else {
        setBulkError(response.message || "Upload failed");
      }
    } catch (err: unknown) {
      setBulkError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBulkUploading(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifySubject.trim() || !notifyMessage.trim()) {
      setNotifyError("Subject and message are required");
      return;
    }
    setNotifySending(true);
    setNotifyError(null);
    setNotifySuccess(null);
    try {
      const response = await sendNotification({
        title: notifySubject,
        message: notifyMessage,
        recipient_type: notifyRecipients as "all" | "specific" | "segment",
      }) as ApiResponse<unknown>;
      if (response.success) {
        setNotifySuccess(response.message || "Notification sent successfully");
        setNotifySubject("");
        setNotifyMessage("");
        setNotifyRecipients("all");
      } else {
        setNotifyError(response.message || "Failed to send notification");
      }
    } catch (err: unknown) {
      setNotifyError(err instanceof Error ? err.message : "Failed to send notification");
    } finally {
      setNotifySending(false);
    }
  };

  const columns = [
    {
      key: "employee_id",
      label: "Employee ID",
    },
    {
      key: "full_name",
      label: "Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "enrollment_status",
      label: "Enrollment",
      render: (value: unknown) => {
        const v = String(value ?? '');
        const statusClass = v === "enrolled"
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : value === "pending"
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
            : "bg-muted text-muted-foreground";
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
            {v}
          </span>
        );
      },
    },
    {
      key: "engagement_status",
      label: "Status",
      render: (value: unknown) => {
        const v = String(value ?? '');
        const statusClass = v === "active"
          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
          : "bg-muted text-muted-foreground";
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
            {v}
          </span>
        );
      },
    },
    {
      key: "program_assignments",
      label: "Programs",
      render: (value: unknown) => (
        <span className="text-sm">{Array.isArray(value) ? value.length : 0} enrolled</span>
      ),
    },
    {
      key: "risk_category",
      label: "Risk",
      render: (value: unknown) => {
        const v = String(value ?? '');
        const riskClass = v === "low"
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            : v === "medium"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
              : v === "high"
                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                : "bg-muted text-muted-foreground";
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${riskClass}`}>
            {v}
          </span>
        );
      },
    },
    {
      key: "last_active_at",
      label: "Last Active",
      render: (value: unknown) =>
        value ? new Date(String(value)).toLocaleDateString() : "Never",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Employee Management
          </h1>
          <p className="text-muted-foreground">
            Onboard and manage employees within your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Employee List</TabsTrigger>
          <TabsTrigger value="add">Add Employee</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          <TabsTrigger value="notify">Send Notification</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Employees</CardTitle>
              <CardDescription>
                View and manage employee enrollment and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className={errorType === 'auth' ? 'p-4 rounded-lg border flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'p-4 rounded-lg border flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}>
                  <AlertCircle className={errorType === 'auth' ? 'h-5 w-5 mt-0.5 text-yellow-600 dark:text-yellow-400' : 'h-5 w-5 mt-0.5 text-red-600 dark:text-red-400'} />
                  <div className="flex-1">
                    <p className={errorType === 'auth' ? 'text-sm font-medium text-yellow-900 dark:text-yellow-400' : 'text-sm font-medium text-red-900 dark:text-red-400'}>
                      {errorType === 'auth' ? 'Authentication Required' : 'Error Loading Employees'}
                    </p>
                    <p className={errorType === 'auth' ? 'text-xs mt-1 text-yellow-700 dark:text-yellow-500' : 'text-xs mt-1 text-red-700 dark:text-red-500'}>{error}</p>
                    <div className="flex gap-2 mt-3">
                      {errorType === 'auth' && !isAuthenticated ? (
                        <Button onClick={() => router.push('/login')} size="sm">Go to Login</Button>
                      ) : (
                        <Button onClick={() => fetchEmployees()} size="sm" disabled={loading}>
                          {loading ? 'Retrying...' : 'Retry'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <DataTable
                  data={employees}
                  columns={columns}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Employee</CardTitle>
              <CardDescription>
                Manually onboard a new employee to the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {addEmployeeSuccess && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-400">Employee added successfully!</p>
                    <p className="text-xs text-green-700 dark:text-green-500 mt-1">
                      {String(addEmployeeResponseData?.full_name || 'The employee')} has been added to your organization.
                    </p>
                    {!!addEmployeeResponseData?.temporary_password && (
                      <div className="mt-3 p-3 bg-card border border-green-300 dark:border-green-700 rounded">
                        <p className="text-xs font-semibold text-green-900 dark:text-green-400 mb-1">
                          Temporary Password (Share with employee):
                        </p>
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {String(addEmployeeResponseData.temporary_password)}
                        </code>
                        <p className="text-xs text-green-700 dark:text-green-500 mt-2">
                          Note: Save this password - it won&apos;t be shown again.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {addEmployeeError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">Error adding employee</p>
                    <p className="text-xs text-red-700 mt-1">{addEmployeeError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstname">First Name *</Label>
                    <Input
                      id="firstname"
                      placeholder="John"
                      value={addEmployeeForm.firstname}
                      onChange={(e) => handleFormChange("firstname", e.target.value)}
                      className={addEmployeeValidationErrors.firstname ? "border-red-500" : ""}
                      required
                    />
                    {addEmployeeValidationErrors.firstname && (
                      <p className="text-xs text-red-600">{addEmployeeValidationErrors.firstname[0]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastname">Last Name *</Label>
                    <Input
                      id="lastname"
                      placeholder="Doe"
                      value={addEmployeeForm.lastname}
                      onChange={(e) => handleFormChange("lastname", e.target.value)}
                      className={addEmployeeValidationErrors.lastname ? "border-red-500" : ""}
                      required
                    />
                    {addEmployeeValidationErrors.lastname && (
                      <p className="text-xs text-red-600">{addEmployeeValidationErrors.lastname[0]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@company.com"
                      value={addEmployeeForm.email}
                      onChange={(e) => handleFormChange("email", e.target.value)}
                      className={addEmployeeValidationErrors.email ? "border-red-500" : ""}
                      required
                    />
                    {addEmployeeValidationErrors.email && (
                      <p className="text-xs text-red-600">{addEmployeeValidationErrors.email[0]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+250788123456"
                      value={addEmployeeForm.phone}
                      onChange={(e) => handleFormChange("phone", e.target.value)}
                      className={addEmployeeValidationErrors.phone ? "border-red-500" : ""}
                    />
                    {addEmployeeValidationErrors.phone && (
                      <p className="text-xs text-red-600">{addEmployeeValidationErrors.phone[0]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employee_identifier">Employee Identifier</Label>
                    <Input
                      id="employee_identifier"
                      placeholder="EMP001"
                      value={addEmployeeForm.employee_identifier}
                      onChange={(e) => handleFormChange("employee_identifier", e.target.value)}
                      className={addEmployeeValidationErrors.employee_identifier ? "border-red-500" : ""}
                    />
                    {addEmployeeValidationErrors.employee_identifier && (
                      <p className="text-xs text-red-600">{addEmployeeValidationErrors.employee_identifier[0]}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password (Optional)</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Leave blank to auto-generate"
                    value={addEmployeeForm.password}
                    onChange={(e) => handleFormChange("password", e.target.value)}
                    className={addEmployeeValidationErrors.password ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    If not provided, a random 12-character password will be generated
                  </p>
                  {addEmployeeValidationErrors.password && (
                    <p className="text-xs text-red-600">{addEmployeeValidationErrors.password[0]}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAddEmployeeForm({
                        firstname: "",
                        lastname: "",
                        email: "",
                        phone: "",
                        employee_identifier: "",
                        password: "",
                      });
                      setAddEmployeeError(null);
                      setAddEmployeeValidationErrors({});
                      setAddEmployeeSuccess(false);
                      setAddEmployeeResponseData(null);
                    }}
                  >
                    Clear
                  </Button>
                  <Button type="submit" disabled={addEmployeeLoading}>
                    {addEmployeeLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Employee
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload Employees</CardTitle>
              <CardDescription>
                Upload a CSV file to onboard multiple employees at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bulkError && (
                <div className="p-3 rounded-md bg-red-50 text-red-800 text-sm">{bulkError}</div>
              )}
              {bulkSuccess && (
                <div className="p-3 rounded-md bg-green-50 text-green-800 text-sm">{bulkSuccess}</div>
              )}
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                {bulkFile ? (
                  <p className="text-sm font-medium mb-2">Selected: {bulkFile.name}</p>
                ) : (
                  <p className="text-sm font-medium mb-2">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                )}
                <p className="text-xs text-muted-foreground mb-4">
                  Maximum file size: 5MB
                </p>
                <Input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  id="csvUpload"
                  onChange={(e) => {
                    setBulkFile(e.target.files?.[0] || null);
                    setBulkError(null);
                    setBulkSuccess(null);
                  }}
                />
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" asChild>
                    <label htmlFor="csvUpload" className="cursor-pointer">
                      Select File
                    </label>
                  </Button>
                  {bulkFile && (
                    <Button onClick={handleBulkUpload} disabled={bulkUploading}>
                      <Upload className="h-4 w-4 mr-2" />
                      {bulkUploading ? "Uploading..." : "Upload"}
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">CSV Format Requirements:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Required columns: firstname, lastname, email</li>
                  <li>Optional columns: phone</li>
                  <li>First row should contain column headers</li>
                  <li>Maximum file size: 5MB</li>
                </ul>
                <Button variant="link" size="sm" className="px-0">
                  Download Sample CSV Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notify">
          <Card>
            <CardHeader>
              <CardTitle>Send Notification</CardTitle>
              <CardDescription>
                Send reminders or notifications to employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifyError && (
                <div className="mb-4 p-3 rounded-md bg-red-50 text-red-800 text-sm">{notifyError}</div>
              )}
              {notifySuccess && (
                <div className="mb-4 p-3 rounded-md bg-green-50 text-green-800 text-sm">{notifySuccess}</div>
              )}
              <form className="space-y-4" onSubmit={handleSendNotification}>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Health program reminder"
                    value={notifySubject}
                    onChange={(e) => setNotifySubject(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <textarea
                    id="message"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your message here..."
                    value={notifyMessage}
                    onChange={(e) => setNotifyMessage(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Recipients</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="recipients" value="all" checked={notifyRecipients === "all"} onChange={(e) => setNotifyRecipients(e.target.value)} />
                      <span className="text-sm">All Employees</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="recipients" value="segment" checked={notifyRecipients === "segment"} onChange={(e) => setNotifyRecipients(e.target.value)} />
                      <span className="text-sm">Segmented Group</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="recipients" value="specific" checked={notifyRecipients === "specific"} onChange={(e) => setNotifyRecipients(e.target.value)} />
                      <span className="text-sm">Specific Employees</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setNotifySubject(""); setNotifyMessage(""); setNotifyRecipients("all"); }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={notifySending}>
                    <Send className="h-4 w-4 mr-2" />
                    {notifySending ? "Sending..." : "Send Notification"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
