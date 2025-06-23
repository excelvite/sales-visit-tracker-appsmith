
import { Store } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StoreContactCardProps {
  store: Store;
}

export function StoreContactCard({ store }: StoreContactCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          <div>
            <dt className="font-medium text-muted-foreground">Full Address:</dt>
            <dd className="mt-1">
              {store.address ? (
                <div>
                  <div>{store.address}</div>
                  <div>{store.city && store.zipCode ? `${store.city} ${store.zipCode}` : store.city || store.zipCode || ""}</div>
                  <div>{store.state}</div>
                </div>
              ) : "No address provided"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Phone:</dt>
            <dd>{store.phone || "Not provided"}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Email:</dt>
            <dd>{store.email || "Not provided"}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">PIC Info:</dt>
            <dd>{store.picInfo || "Not provided"}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Salesperson:</dt>
            <dd>{store.salesperson || "Unassigned"}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
