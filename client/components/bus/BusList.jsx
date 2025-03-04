import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useBusStore from "@/stores/bus-store";

export function BusList() {
  const { buses, loading, error, fetchBuses, clearError, retryCount } = useBusStore();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            {retryCount > 1 ? `Retrying (${retryCount}/3)...` : 'Loading buses...'}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <Button 
              onClick={() => {
                clearError();
                fetchBuses();
              }}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!buses || buses.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">No buses available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {buses.map((bus) => (
        <Card key={bus.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Bus {bus.busNumber}</span>
              <Badge variant={bus.isActive ? "success" : "secondary"}>
                {bus.isActive ? "Active" : "Inactive"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Capacity:</span> {bus.capacity} seats
              </p>
              {bus.description && (
                <p className="text-sm text-muted-foreground">
                  {bus.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
