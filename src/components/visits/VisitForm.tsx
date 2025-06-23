
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  VisitStatus, 
  VisitType, 
  PotentialLevel, 
  Store,
  VisitLog
} from "@/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addVisitLog, getVisitLogs, updateProductsList, getProductsList } from "@/services/mockDataService";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Check, ChevronsUpDown, Plus, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface VisitFormProps {
  stores: Store[];
  onSuccess?: () => void;
  preSelectedStore?: Store;
  visit?: VisitLog;
  isEditing?: boolean;
}

// Schema with all optional fields except storeId
const FormSchema = z.object({
  storeId: z.string().min(1, { message: "Please select a store" }),
  date: z.date().optional(),
  visitType: z.nativeEnum(VisitType).optional(),
  visitStatus: z.array(z.nativeEnum(VisitStatus)).optional(),
  productsPromoted: z.array(z.string()).optional(),
  potentialLevel: z.nativeEnum(PotentialLevel).optional(),
  updateRemarks: z.string().optional(),
  nextSteps: z.string().optional(),
  accountOpenedDate: z.date().optional(),
});

export function VisitForm({ stores = [], onSuccess, preSelectedStore, visit, isEditing = false }: VisitFormProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | undefined>(preSelectedStore);
  const [hasOpenedAccount, setHasOpenedAccount] = useState(false);
  const [productsList, setProductsList] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  
  // Ensure stores is always an array and add better error handling
  const safeStores = Array.isArray(stores) ? stores.filter(store => store && store.id && store.name) : [];
  
  // Load products list on component mount
  useEffect(() => {
    try {
      const products = getProductsList();
      setProductsList(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error("Error loading products:", error);
      setProductsList([]);
    }
  }, []);
  
  // Get previous visit logs to check if store already has an opened account
  useEffect(() => {
    if (selectedStore) {
      try {
        const visitLogs = getVisitLogs().filter(log => log.storeId === selectedStore.id);
        const hasOpened = visitLogs.some(log => log.visitStatus.includes(VisitStatus.OPENED_ACCOUNT));
        setHasOpenedAccount(hasOpened);
      } catch (error) {
        console.error("Error checking visit logs:", error);
        setHasOpenedAccount(false);
      }
    }
  }, [selectedStore]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      storeId: visit?.storeId || preSelectedStore?.id || "",
      date: visit?.date || new Date(),
      visitType: visit?.visitType || VisitType.FIRST_VISIT,
      visitStatus: visit?.visitStatus || [],
      productsPromoted: visit?.productsPromoted || [],
      potentialLevel: visit?.potentialLevel || PotentialLevel.MEDIUM,
      updateRemarks: visit?.notes || "",
      nextSteps: visit?.nextSteps || "",
      accountOpenedDate: visit?.accountOpenedDate,
    },
  });

  // Watch the visit status to check if "Opened Account" is selected
  const selectedVisitStatus = form.watch("visitStatus") || [];
  const isOpenedAccountSelected = selectedVisitStatus.includes(VisitStatus.OPENED_ACCOUNT);
  
  // Update the selected store when storeId changes
  useEffect(() => {
    const storeId = form.getValues("storeId");
    if (storeId && safeStores.length > 0) {
      const store = safeStores.find(s => s.id === storeId);
      setSelectedStore(store);
      
      // Reset visit status if needed when changing stores
      if (store && hasOpenedAccount) {
        const currentStatus = form.getValues("visitStatus");
        if (currentStatus?.includes(VisitStatus.OPENED_ACCOUNT)) {
          form.setValue("visitStatus", currentStatus.filter(
            status => status !== VisitStatus.OPENED_ACCOUNT
          ));
        }
      }
    }
  }, [form.watch("storeId"), safeStores, hasOpenedAccount]);

  // Add new product to the list
  const handleAddProduct = () => {
    if (newProduct.trim() && !productsList.includes(newProduct.trim())) {
      const updatedProducts = [...productsList, newProduct.trim()];
      setProductsList(updatedProducts);
      updateProductsList(updatedProducts);
      setNewProduct("");
      setShowAddProduct(false);
      toast({
        title: "Product added",
        description: "New product has been added to the list.",
      });
    }
  };

  // Prepare visit status options based on store's history
  const getVisitStatusOptions = () => {
    let options = [
      { id: VisitStatus.VISITED, label: "Visited" },
      { id: VisitStatus.REJECTED_VISIT, label: "Rejected Visit" },
      { id: VisitStatus.CLOSED_DOWN, label: "Closed Down" },
    ];
    
    // Only add "Opened Account" option if the store hasn't opened an account yet
    if (!hasOpenedAccount) {
      options.push({ id: VisitStatus.OPENED_ACCOUNT, label: "Opened Account" });
    }
    
    // Add "Ex-customer" option only if the store has opened an account before
    if (hasOpenedAccount) {
      options.push({ id: VisitStatus.EX_CUSTOMER, label: "Ex-customer" });
    }
    
    return options;
  };
  
  const visitStatusOptions = getVisitStatusOptions();

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    try {
      // Find the store name
      const store = safeStores.find(s => s.id === data.storeId);
      const storeName = store?.name || "Unknown Store";
      
      // Create the visit log with defaults for optional fields
      const visitLog = {
        id: visit?.id || String(Date.now()),
        storeId: data.storeId,
        storeName: storeName,
        userId: currentUser.id,
        userName: currentUser.name,
        date: data.date || new Date(),
        visitType: data.visitType || VisitType.FIRST_VISIT,
        visitStatus: data.visitStatus || [],
        productsPromoted: data.productsPromoted || [],
        potentialLevel: data.potentialLevel || PotentialLevel.MEDIUM,
        notes: data.updateRemarks || "",
        nextSteps: data.nextSteps || "",
        accountOpenedDate: isOpenedAccountSelected ? data.accountOpenedDate || data.date : undefined,
      };

      if (isEditing && visit?.id) {
        // Update existing visit (you'll need to implement updateVisitLog in mockDataService)
        console.log("Updating visit:", visitLog);
      } else {
        addVisitLog(visitLog);
      }
      
      toast({
        title: isEditing ? "Visit updated successfully" : "Visit logged successfully",
        description: isEditing ? "Your visit has been updated." : "Your visit has been recorded.",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/visits");
      }
    } catch (error) {
      console.error("Error submitting visit:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'log'} visit. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show loading state while stores are being fetched
  if (safeStores.length === 0 && stores !== undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <div className="w-6 h-6 border-2 border-sales-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground">Loading stores...</p>
      </div>
    );
  }

  // Show error state if no stores available
  if (safeStores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <p className="text-sm text-muted-foreground">No stores available. Please add stores first.</p>
        <Button onClick={() => navigate("/stores/new")} className="bg-sales-blue hover:bg-blue-800">
          Add Store
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Store Field */}
          <FormField
            control={form.control}
            name="storeId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Store *</FormLabel>
                <Popover open={open && !preSelectedStore} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={!!preSelectedStore}
                        aria-expanded={open}
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value && safeStores.length > 0
                          ? safeStores.find((store) => store.id === field.value)?.name || "Select a store"
                          : "Select a store"}
                        {!preSelectedStore && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search store..." />
                      <CommandList>
                        <CommandEmpty>No store found.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                          {safeStores && safeStores.length > 0 ? safeStores.map((store) => (
                            <CommandItem
                              key={store.id}
                              value={`${store.name}-${store.id}`}
                              onSelect={() => {
                                form.setValue("storeId", store.id);
                                setSelectedStore(store);
                                setOpen(false);
                                
                                // Check if this store has already opened an account
                                try {
                                  const visitLogs = getVisitLogs().filter(log => log.storeId === store.id);
                                  const hasOpened = visitLogs.some(log => 
                                    log.visitStatus.includes(VisitStatus.OPENED_ACCOUNT)
                                  );
                                  setHasOpenedAccount(hasOpened);
                                } catch (error) {
                                  console.error("Error checking account status:", error);
                                  setHasOpenedAccount(false);
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  store.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {store.name} {store.category ? `(${store.category})` : ''}
                            </CommandItem>
                          )) : (
                            <CommandItem disabled>No stores available</CommandItem>
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Field */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Visit Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Visit Type */}
          <FormField
            control={form.control}
            name="visitType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visit Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visit type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={VisitType.FIRST_VISIT}>First Visit</SelectItem>
                    <SelectItem value={VisitType.REVISIT}>Revisit</SelectItem>
                    <SelectItem value={VisitType.FOLLOW_UP}>Non-Physical Follow Up</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Potential Level */}
          <FormField
            control={form.control}
            name="potentialLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Potential Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select potential level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={PotentialLevel.HIGH}>High</SelectItem>
                    <SelectItem value={PotentialLevel.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={PotentialLevel.LOW}>Low</SelectItem>
                    <SelectItem value={PotentialLevel.NA}>N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Visit Status */}
        <FormField
          control={form.control}
          name="visitStatus"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Visit Status</FormLabel>
                <FormDescription>
                  Select all that apply
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {visitStatusOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="visitStatus"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), option.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== option.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account Opened Date - Only shown when "Opened Account" status is selected */}
        {isOpenedAccountSelected && (
          <FormField
            control={form.control}
            name="accountOpenedDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Account Opened Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      defaultMonth={form.getValues("date")}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Select the date when the account was opened (defaults to visit date if not specified)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Products */}
        <FormField
          control={form.control}
          name="productsPromoted"
          render={({ field }) => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Products</FormLabel>
                <FormDescription>
                  Select all that apply
                </FormDescription>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {productsList && productsList.length > 0 ? productsList.map((product) => (
                    <FormField
                      key={product}
                      control={form.control}
                      name="productsPromoted"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={product}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(product)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), product])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== product
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {product}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  )) : (
                    <p className="text-sm text-muted-foreground">No products available</p>
                  )}
                </div>
                
                {/* Add new product option */}
                <div className="border-t pt-4">
                  {!showAddProduct ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddProduct(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Product
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter new product name..."
                        value={newProduct}
                        onChange={(e) => setNewProduct(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddProduct()}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddProduct}
                        disabled={!newProduct.trim()}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddProduct(false);
                          setNewProduct("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Update/Remarks */}
        <FormField
          control={form.control}
          name="updateRemarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Update/Remarks</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any updates or remarks about this visit"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Next Steps */}
        <FormField
          control={form.control}
          name="nextSteps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next Steps</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the planned next steps for this store"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-sales-blue hover:bg-blue-800"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : (isEditing ? "Update Visit Log" : "Save Visit Log")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default VisitForm;
