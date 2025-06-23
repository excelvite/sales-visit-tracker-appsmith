
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole, StoreCategory } from "@/types";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import VisitLogTable from "@/components/dashboard/VisitLogTable";
import WeeklySummaryCard from "@/components/dashboard/WeeklySummaryCard";
import MonthlySummaryCard from "@/components/dashboard/MonthlySummaryCard";
import { DateRangeFilter, DateRangeOption } from "@/components/DateRangeFilter";
import { getStores, getVisitLogs, getWeeklySummary, getMonthlySummary, getUniverseTracking } from "@/services/mockDataService";
import { Store, CalendarCheck, CalendarPlus, Store as StoreIcon } from "lucide-react";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths } from "date-fns";

interface SalespersonStats {
  stores: number;
  vetClinics: number;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [stores, setStores] = useState([]);
  const [visits, setVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [universeTracking, setUniverseTracking] = useState(null);
  const [salespersonStats, setSalespersonStats] = useState<{ [key: string]: SalespersonStats }>({});
  const [dateFilter, setDateFilter] = useState<DateRangeOption>("this-week");
  const [customDateRange, setCustomDateRange] = useState<{ from: Date; to: Date }>();

  const loadData = () => {
    const allStores = getStores();
    const allVisits = getVisitLogs();
    setStores(allStores);
    setVisits(allVisits);
    setWeeklySummary(getWeeklySummary());
    setMonthlySummary(getMonthlySummary());
    setUniverseTracking(getUniverseTracking());

    // Calculate stores and vet clinics by salesperson
    const stats: { [key: string]: SalespersonStats } = {};
    allStores.forEach(store => {
      const salesperson = store.salesperson || "Unassigned";
      if (!stats[salesperson]) {
        stats[salesperson] = { stores: 0, vetClinics: 0 };
      }
      
      if (store.category === StoreCategory.VET) {
        stats[salesperson].vetClinics++;
      } else {
        stats[salesperson].stores++;
      }
    });
    
    setSalespersonStats(stats);
  };

  // Filter visits based on selected date range
  useEffect(() => {
    const getDateRange = (option: DateRangeOption) => {
      const now = new Date();
      
      switch (option) {
        case "this-week":
          return {
            from: startOfWeek(now, { weekStartsOn: 1 }),
            to: endOfWeek(now, { weekStartsOn: 1 })
          };
        case "last-week":
          const lastWeek = subWeeks(now, 1);
          return {
            from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
            to: endOfWeek(lastWeek, { weekStartsOn: 1 })
          };
        case "this-month":
          return {
            from: startOfMonth(now),
            to: endOfMonth(now)
          };
        case "last-month":
          const lastMonth = subMonths(now, 1);
          return {
            from: startOfMonth(lastMonth),
            to: endOfMonth(lastMonth)
          };
        case "this-year":
          return {
            from: startOfYear(now),
            to: endOfYear(now)
          };
        case "last-year":
          const lastYear = new Date(now.getFullYear() - 1, 0, 1);
          return {
            from: startOfYear(lastYear),
            to: endOfYear(lastYear)
          };
        case "custom":
          return customDateRange || { from: now, to: now };
        default:
          return { from: now, to: now };
      }
    };

    const range = getDateRange(dateFilter);
    const filtered = visits.filter(visit => {
      const visitDate = new Date(visit.date);
      return visitDate >= range.from && visitDate <= range.to;
    });
    
    setFilteredVisits(filtered);
  }, [visits, dateFilter, customDateRange]);

  useEffect(() => {
    loadData();
  }, []);

  const handleDateFilterChange = (option: DateRangeOption, customRange?: { from: Date; to: Date }) => {
    setDateFilter(option);
    if (customRange) {
      setCustomDateRange(customRange);
    }
  };

  const canAddVisit = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SALES;
  const canAddStore = currentUser?.role === UserRole.ADMIN;

  const totalStores = stores.filter(store => store.category !== StoreCategory.VET).length;
  const totalVetClinics = stores.filter(store => store.category === StoreCategory.VET).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {currentUser?.name}
          </p>
        </div>
        <div className="flex gap-3">
          {canAddVisit && (
            <Button 
              className="bg-sales-blue hover:bg-blue-800"
              onClick={() => navigate("/visits/new")}
            >
              <CalendarPlus className="h-4 w-4 mr-2" /> Log Visit
            </Button>
          )}
          {canAddStore && (
            <Button 
              variant="outline"
              onClick={() => navigate("/stores/new")}
            >
              <StoreIcon className="h-4 w-4 mr-2" /> Add Store
            </Button>
          )}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Visit Statistics</h2>
        <DateRangeFilter
          value={dateFilter}
          customRange={customDateRange}
          onValueChange={handleDateFilterChange}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Pet Stores"
          value={totalStores}
          icon={<StoreIcon />}
          className="bg-gradient-to-br from-sales-blue/10 to-transparent"
        />
        <StatCard
          title="Total Vet Clinics"
          value={totalVetClinics}
          icon={<StoreIcon />}
          className="bg-gradient-to-br from-sales-purple/10 to-transparent"
        />
        <StatCard
          title="Total Visits"
          value={visits.length}
          icon={<CalendarCheck />}
          className="bg-gradient-to-br from-sales-teal/10 to-transparent"
        />
        <StatCard
          title={`Visits (${dateFilter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())})`}
          value={filteredVisits.length}
          icon={<CalendarPlus />}
          className="bg-gradient-to-br from-sales-green/10 to-transparent"
        />
      </div>

      {/* Salesperson Stats */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Stores & Vet Clinics by Salesperson</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(salespersonStats).map(([salesperson, stats]) => (
            <div key={salesperson} className="p-4 border rounded-lg">
              <h4 className="font-medium text-sm mb-2">{salesperson}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pet Stores:</span>
                  <span className="font-medium">{stats.stores}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vet Clinics:</span>
                  <span className="font-medium">{stats.vetClinics}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">{stats.stores + stats.vetClinics}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VisitLogTable visits={filteredVisits} stores={stores} />
        </div>
        <div>
          {weeklySummary && <WeeklySummaryCard summary={weeklySummary} />}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {universeTracking && (
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <h3 className="text-lg font-medium mb-4">Universe Tracking</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-sales-blue/10 rounded-md">
                  <div className="text-lg font-semibold">{universeTracking.totalVetUniverse}</div>
                  <div className="text-sm text-muted-foreground">Total Vet Universe</div>
                </div>
                <div className="p-3 bg-sales-purple/10 rounded-md">
                  <div className="text-lg font-semibold">{universeTracking.totalPetStores}</div>
                  <div className="text-sm text-muted-foreground">Total Pet Stores</div>
                </div>
                <div className="p-3 bg-sales-green/10 rounded-md">
                  <div className="text-lg font-semibold">{universeTracking.visitedVetStores}</div>
                  <div className="text-sm text-muted-foreground">Vets Visited</div>
                </div>
                <div className="p-3 bg-sales-teal/10 rounded-md">
                  <div className="text-lg font-semibold">{universeTracking.visitedPetStores}</div>
                  <div className="text-sm text-muted-foreground">Pet Stores Visited</div>
                </div>
              </div>

              {/* State Breakdown */}
              <div className="mt-6">
                <h4 className="text-md font-medium mb-3">Coverage by State</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Object.entries(universeTracking.stateBreakdown || {}).map(([state, data]: [string, any]) => (
                    <div key={state} className="border rounded-lg p-3">
                      <div className="font-medium text-sm mb-2">{state}</div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="text-muted-foreground">Veterinary</div>
                          <div className="flex justify-between">
                            <span>{data.vet?.visited || 0} / {data.vet?.total || 0}</span>
                            <span className="font-medium">{data.vet?.coverage || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div 
                              className="bg-sales-blue h-1 rounded-full" 
                              style={{ width: `${data.vet?.coverage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Pet Stores</div>
                          <div className="flex justify-between">
                            <span>{data.petStore?.visited || 0} / {data.petStore?.total || 0}</span>
                            <span className="font-medium">{data.petStore?.coverage || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div 
                              className="bg-sales-teal h-1 rounded-full" 
                              style={{ width: `${data.petStore?.coverage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div>
          {monthlySummary && <MonthlySummaryCard summary={monthlySummary} />}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
