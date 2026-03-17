import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  MapPin, Plus, Edit, Trash2, Phone, Home, Truck, Building2, Loader2,
} from "lucide-react";
import { DelayedLoader } from "@/components/ui/DelayedLoader";
import { AddressesSkeleton } from "@/components/skeletons";

interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  street: string;
  area: string | null;
  city: string;
  postal_code: string | null;
  is_default: boolean;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  address_type: "shipping" | "billing" | "both";
}

const addressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  full_name: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  street: z.string().min(5, "Street address is required"),
  area: z.string().optional(),
  city: z.string().min(2, "City is required"),
  postal_code: z.string().optional(),
  address_type: z.enum(["shipping", "billing", "both"]),
});

export default function AccountAddresses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const addressForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "", full_name: "", phone: "", street: "", area: "", city: "", postal_code: "",
      address_type: "shipping" as "shipping" | "billing" | "both",
    },
  });

  const fetchAddresses = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (data) {
        setAddresses(data.map((addr: any) => ({
          id: addr.id, label: addr.label, full_name: addr.full_name, phone: addr.phone,
          street: addr.street_address, area: addr.area, city: addr.city, postal_code: addr.postal_code,
          is_default: addr.is_default ?? false, is_default_shipping: addr.is_default ?? false,
          is_default_billing: addr.is_default ?? false, address_type: "both" as const,
        })));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, [user]);

  const handleAddressSubmit = async (values: z.infer<typeof addressSchema>) => {
    if (!user) return;
    setSavingAddress(true);
    try {
      if (editingAddress) {
        const { error } = await supabase
          .from("user_addresses")
          .update({ label: values.label, full_name: values.full_name, phone: values.phone, street: values.street, area: values.area || null, city: values.city, postal_code: values.postal_code || null, address_type: values.address_type })
          .eq("id", editingAddress.id);
        if (error) throw error;
        toast({ title: "Success", description: "Address updated successfully" });
      } else {
        const isFirst = addresses.length === 0;
        const { error } = await supabase
          .from("user_addresses")
          .insert({ user_id: user.id, label: values.label, full_name: values.full_name, phone: values.phone, street_address: values.street, area: values.area || null, city: values.city, postal_code: values.postal_code || null, is_default: isFirst });
        if (error) throw error;
        toast({ title: "Success", description: "New address added successfully" });
      }
      setAddressDialogOpen(false);
      setEditingAddress(null);
      addressForm.reset();
      fetchAddresses();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (!deletingAddress) return;
    try {
      const { error } = await supabase.from("user_addresses").delete().eq("id", deletingAddress.id);
      if (error) throw error;
      toast({ title: "Success", description: "Address deleted" });
      setDeletingAddress(null);
      fetchAddresses();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSetDefault = async (address: Address) => {
    try {
      await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", user?.id);
      const { error } = await supabase.from("user_addresses").update({ is_default: true }).eq("id", address.id);
      if (error) throw error;
      toast({ title: "Success", description: "Default address set" });
      fetchAddresses();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const openEdit = (address: Address) => {
    setEditingAddress(address);
    addressForm.reset({ label: address.label, full_name: address.full_name, phone: address.phone, street: address.street, area: address.area || "", city: address.city, postal_code: address.postal_code || "", address_type: address.address_type });
    setAddressDialogOpen(true);
  };

  const openNew = () => {
    setEditingAddress(null);
    addressForm.reset({ label: "", full_name: "", phone: "", street: "", area: "", city: "", postal_code: "", address_type: "shipping" });
    setAddressDialogOpen(true);
  };

  if (loading) {
    return <DelayedLoader><AddressesSkeleton /></DelayedLoader>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Addresses</h1>
            <p className="text-sm text-muted-foreground">Manage your shipping and billing addresses</p>
          </div>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add Address</Button>
        </div>

        {/* Address Cards */}
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">No addresses saved</h3>
                <p className="text-muted-foreground mb-4">Add an address for faster checkout</p>
                <Button onClick={openNew} variant="outline"><Plus className="h-4 w-4 mr-2" />Add Address</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <Card key={address.id} className={address.is_default ? "border-primary" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={address.is_default ? "default" : "secondary"}>{address.label}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {address.address_type === "both" ? <><Truck className="h-3 w-3 mr-1" /><Building2 className="h-3 w-3 mr-1" />Both</> : address.address_type === "billing" ? <><Building2 className="h-3 w-3 mr-1" />Billing</> : <><Truck className="h-3 w-3 mr-1" />Shipping</>}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(address)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeletingAddress(address)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  {address.is_default && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="text-xs border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20"><Truck className="h-3 w-3 mr-1" />Default Shipping</Badge>
                      <Badge variant="outline" className="text-xs border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20"><Building2 className="h-3 w-3 mr-1" />Default Billing</Badge>
                    </div>
                  )}
                  {!address.is_default && (
                    <div className="mb-3">
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleSetDefault(address)}><Truck className="h-3 w-3 mr-1" />Set Default</Button>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="font-medium">{address.full_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-3 w-3" />{address.phone}</div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground"><Home className="h-3 w-3 mt-0.5" /><span>{address.street}{address.area && `, ${address.area}`}{address.city && `, ${address.city}`}{address.postal_code && ` - ${address.postal_code}`}</span></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Address Dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={(open) => { if (!open) { setEditingAddress(null); addressForm.reset(); } setAddressDialogOpen(open); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle></DialogHeader>
          <Form {...addressForm}>
            <form onSubmit={addressForm.handleSubmit(handleAddressSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={addressForm.control} name="label" render={({ field }) => (<FormItem><FormLabel>Label</FormLabel><FormControl><Input placeholder="Home, Office, etc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={addressForm.control} name="address_type" render={({ field }) => (<FormItem><FormLabel>Address Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="shipping">Shipping</SelectItem><SelectItem value="billing">Billing</SelectItem><SelectItem value="both">Both</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={addressForm.control} name="full_name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={addressForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="01XXXXXXXXX" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={addressForm.control} name="street" render={({ field }) => (<FormItem><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="House #, Road #, Area" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-3 gap-4">
                <FormField control={addressForm.control} name="area" render={({ field }) => (<FormItem><FormLabel>Area</FormLabel><FormControl><Input placeholder="Area" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={addressForm.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="City" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={addressForm.control} name="postal_code" render={({ field }) => (<FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input placeholder="1234" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <Button type="submit" disabled={savingAddress} className="w-full">
                {savingAddress && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingAddress ? "Update Address" : "Save Address"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingAddress} onOpenChange={(open) => !open && setDeletingAddress(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove "{deletingAddress?.label}" from your saved addresses.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAddress} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
