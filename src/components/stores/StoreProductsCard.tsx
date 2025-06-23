
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Plus, X, Edit, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getProductsList, updateProductsList } from "@/services/mockDataService";

interface StoreProductsCardProps {
  products: string[];
  storeId: string;
  canEdit?: boolean;
  onProductsUpdate?: (products: string[]) => void;
}

export function StoreProductsCard({ 
  products, 
  storeId, 
  canEdit = false, 
  onProductsUpdate 
}: StoreProductsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProducts, setEditedProducts] = useState<string[]>(products);
  const [availableProducts, setAvailableProducts] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load available products list
    const productsList = getProductsList();
    setAvailableProducts(productsList);
  }, []);

  useEffect(() => {
    setEditedProducts(products);
  }, [products]);

  const handleProductToggle = (product: string, checked: boolean) => {
    if (checked) {
      setEditedProducts([...editedProducts, product]);
    } else {
      setEditedProducts(editedProducts.filter(p => p !== product));
    }
  };

  const handleAddNewProduct = () => {
    if (newProduct.trim() && !availableProducts.includes(newProduct.trim())) {
      const updatedAvailableProducts = [...availableProducts, newProduct.trim()];
      setAvailableProducts(updatedAvailableProducts);
      updateProductsList(updatedAvailableProducts);
      setEditedProducts([...editedProducts, newProduct.trim()]);
      setNewProduct("");
      setShowAddProduct(false);
      toast({
        title: "Product added",
        description: "New product has been added to the system.",
      });
    }
  };

  const handleSave = () => {
    onProductsUpdate?.(editedProducts);
    setIsEditing(false);
    toast({
      title: "Products updated",
      description: "Product list has been updated successfully.",
    });
  };

  const handleCancel = () => {
    setEditedProducts(products);
    setNewProduct("");
    setShowAddProduct(false);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products Carried
          </CardTitle>
          {canEdit && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    className="bg-sales-blue hover:bg-blue-800"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {availableProducts.map(product => (
                <div key={product} className="flex items-center space-x-2">
                  <Checkbox
                    id={`product-${product}`}
                    checked={editedProducts.includes(product)}
                    onCheckedChange={(checked) => handleProductToggle(product, checked as boolean)}
                  />
                  <label
                    htmlFor={`product-${product}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {product}
                  </label>
                </div>
              ))}
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
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNewProduct()}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddNewProduct}
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
        ) : (
          <>
            {products.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {products.map(product => (
                  <Badge key={product} variant="outline" className="bg-sales-blue/10 text-sales-blue border-sales-blue/20">
                    {product}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No products recorded yet</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
