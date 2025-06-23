
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  StoreCategory, 
  Species, 
  PaymentTerms, 
  Store 
} from "@/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { addStore, updateStore, getSalespersonList, updateSalespersonList, getProductsList, updateProductsList } from "@/services/mockDataService";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface StoreFormProps {
  store?: Store;
  isEditing?: boolean;
  onSuccess?: () => void;
  preSelectedCategory?: StoreCategory;
}

// Schema with only name as required field
const FormSchema = z.object({
  name: z.string().min(1, { message: "Store name is required" }),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  category: z.nativeEnum(StoreCategory).optional(),
  otherCategoryName: z.string().optional(),
  region: z.string().optional(),
  area: z.string().optional(),
  picInfo: z.string().optional(),
  salesperson: z.string().optional(),
  species: z.nativeEnum(Species).optional(),
  otherSpecies: z.string().optional(),
  paymentTerms: z.nativeEnum(PaymentTerms).optional(),
  otherPaymentTerms: z.string().optional(),
  isExCustomer: z.boolean().optional(),
  productsCarried: z.array(z.string()).optional(),
});

export function StoreForm({ store, isEditing = false, onSuccess, preSelectedCategory }: StoreFormProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salespersonList, setSalespersonList] = useState<string[]>([]);
  const [productsList, setProductsList] = useState<string[]>([]);
  const [newSalesperson, setNewSalesperson] = useState("");
  const [showAddSalesperson, setShowAddSalesperson] = useState(false);

  // Load salesperson and products lists
  useEffect(() => {
    setSalespersonList(getSalespersonList());
    setProductsList(getProductsList());
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: store?.name || "",
      address: store?.address || "",
      city: store?.city || "",
      state: store?.state || "Kuala Lumpur",
      zipCode: store?.zipCode || "",
      phone: store?.phone || "",
      email: store?.email || "",
      category: store?.category || preSelectedCategory || StoreCategory.PET_STORE,
      otherCategoryName: store?.otherCategoryName || "",
      region: store?.region || "",
      area: store?.area || "",
      picInfo: store?.picInfo || "",
      salesperson: store?.salesperson || "",
      species: store?.species || Species.FIFTY_FIFTY,
      otherSpecies: store?.otherSpecies || "",
      paymentTerms: store?.paymentTerms || PaymentTerms.THIRTY_DAYS,
      otherPaymentTerms: store?.otherPaymentTerms || "",
      isExCustomer: store?.isExCustomer || false,
      productsCarried: [], // Will be populated separately
    },
  });

  const watchedCategory = form.watch("category");
  const watchedSpecies = form.watch("species");
  const watchedPaymentTerms = form.watch("paymentTerms");

  const handleAddSalesperson = () => {
    if (newSalesperson.trim() && !salespersonList.includes(newSalesperson.trim())) {
      const updatedList = [...salespersonList, newSalesperson.trim()];
      setSalespersonList(updatedList);
      updateSalespersonList(updatedList);
      form.setValue("salesperson", newSalesperson.trim());
      setNewSalesperson("");
      setShowAddSalesperson(false);
      toast({
        title: "Salesperson added",
        description: "New salesperson has been added to the list.",
      });
    }
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    try {
      const storeData = {
        id: store?.id || String(Date.now()),
        name: data.name,
        address: data.address || "",
        city: data.city || "",
        state: data.state || "Kuala Lumpur",
        zipCode: data.zipCode || "",
        phone: data.phone || "",
        email: data.email || "",
        category: data.category || StoreCategory.PET_STORE,
        otherCategoryName: data.category === StoreCategory.OTHER ? data.otherCategoryName : undefined,
        region: data.region || "",
        area: data.area || "",
        picInfo: data.picInfo || "",
        salesperson: data.salesperson || "",
        species: data.species,
        otherSpecies: data.species === Species.OTHERS ? data.otherSpecies : undefined,
        paymentTerms: data.paymentTerms,
        otherPaymentTerms: data.paymentTerms === PaymentTerms.OTHERS ? data.otherPaymentTerms : undefined,
        isNew: !isEditing,
        createdAt: store?.createdAt || new Date(),
        isExCustomer: data.isExCustomer || false,
      };

      if (isEditing && store?.id) {
        updateStore(storeData);
      } else {
        addStore(storeData);
      }
      
      toast({
        title: isEditing ? "Store updated successfully" : "Store added successfully",
        description: isEditing ? "Store information has been updated." : "New store has been added to the system.",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        const isVetClinic = data.category === StoreCategory.VET;
        navigate(isVetClinic ? "/veterinary-clinics" : "/stores");
      }
    } catch (error) {
      console.error("Error submitting store:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} store. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter store name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={StoreCategory.VET}>Veterinary</SelectItem>
                      <SelectItem value={StoreCategory.PET_STORE}>Pet Store</SelectItem>
                      <SelectItem value={StoreCategory.GROOMING}>Grooming</SelectItem>
                      <SelectItem value={StoreCategory.BREEDING}>Breeding</SelectItem>
                      <SelectItem value={StoreCategory.OTHER}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedCategory === StoreCategory.OTHER && (
              <FormField
                control={form.control}
                name="otherCategoryName"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Other Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Specify other category" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter full address"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter state" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter zip code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Business Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter region" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter area" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="picInfo"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>PIC Information</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter person in charge information"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Salesperson Field with Add New Option */}
            <FormField
              control={form.control}
              name="salesperson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salesperson</FormLabel>
                  <div className="space-y-2">
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select salesperson" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {salespersonList.map(person => (
                          <SelectItem key={person} value={person}>{person}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {!showAddSalesperson ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddSalesperson(true)}
                      >
                        Add New Salesperson
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter new salesperson name..."
                          value={newSalesperson}
                          onChange={(e) => setNewSalesperson(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddSalesperson()}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddSalesperson}
                          disabled={!newSalesperson.trim()}
                        >
                          Add
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowAddSalesperson(false);
                            setNewSalesperson("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Species Information (for vet clinics) */}
        {watchedCategory === StoreCategory.VET && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Species Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Species</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary species" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={Species.CAT_ONLY}>Cat Only</SelectItem>
                        <SelectItem value={Species.DOG_ONLY}>Dog Only</SelectItem>
                        <SelectItem value={Species.MAJORITY_DOG}>Majority Dog</SelectItem>
                        <SelectItem value={Species.MAJORITY_CAT}>Majority Cat</SelectItem>
                        <SelectItem value={Species.FIFTY_FIFTY}>50/50</SelectItem>
                        <SelectItem value={Species.OTHERS}>Others</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedSpecies === Species.OTHERS && (
                <FormField
                  control={form.control}
                  name="otherSpecies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Species Details</FormLabel>
                      <FormControl>
                        <Input placeholder="Specify other species" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        )}

        {/* Payment Terms */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Payment Terms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PaymentTerms.CONSIGNMENT}>Consignment</SelectItem>
                      <SelectItem value={PaymentTerms.ADVANCED_PAYMENT}>Advanced Payment</SelectItem>
                      <SelectItem value={PaymentTerms.THIRTY_DAYS}>30 Days</SelectItem>
                      <SelectItem value={PaymentTerms.SIXTY_DAYS}>60 Days</SelectItem>
                      <SelectItem value={PaymentTerms.NINETY_DAYS}>90 Days</SelectItem>
                      <SelectItem value={PaymentTerms.OTHERS}>Others</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedPaymentTerms === PaymentTerms.OTHERS && (
              <FormField
                control={form.control}
                name="otherPaymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Payment Terms</FormLabel>
                    <FormControl>
                      <Input placeholder="Specify other payment terms" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Ex-Customer Checkbox */}
        <FormField
          control={form.control}
          name="isExCustomer"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Ex-Customer
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Mark this store as an ex-customer
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 pt-6">
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
            {isSubmitting ? "Saving..." : (isEditing ? "Update Store" : "Add Store")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default StoreForm;
