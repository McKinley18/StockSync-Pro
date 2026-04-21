import { PantryItem, PurchaseLogItem, WasteLogItem } from './database';

export class UsageAuditor {
  private pantryItems: PantryItem[];
  private purchaseHistory: PurchaseLogItem[];
  private wasteLog: WasteLogItem[];

  constructor(pantryItems: PantryItem[], purchaseHistory: PurchaseLogItem[], wasteLog: WasteLogItem[]) {
    this.pantryItems = pantryItems;
    this.purchaseHistory = purchaseHistory;
    this.wasteLog = wasteLog;
  }

  /**
   * Calculates how fast an item is consumed (average days between purchase and empty/waste)
   */
  getConsumptionVelocity(itemName: string): number | null {
    const history = this.purchaseHistory.filter(h => h.name.toLowerCase() === itemName.toLowerCase());
    if (history.length < 2) return null;

    const dates = history.map(h => new Date(h.datePurchased).getTime()).sort((a, b) => b - a);
    let totalDiff = 0;
    for (let i = 0; i < dates.length - 1; i++) {
      totalDiff += (dates[i] - dates[i + 1]);
    }

    const avgMs = totalDiff / (dates.length - 1);
    return Math.round(avgMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Identifies items that have been in the pantry for more than 30 days with no change.
   */
  getStagnantItems(): PantryItem[] {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.pantryItems.filter(item => {
      // In a real app, we'd check 'lastModified' or similar. 
      // For this implementation, we check if there are NO purchases or waste events for this item in last 30 days.
      const hasRecentActivity = [...this.purchaseHistory, ...this.wasteLog].some(event => {
        const eventDate = new Date('datePurchased' in event ? event.datePurchased : event.dateWasted);
        return event.name.toLowerCase() === item.name.toLowerCase() && eventDate > thirtyDaysAgo;
      });

      return !hasRecentActivity;
    });
  }

  /**
   * Returns the top most-purchased items.
   */
  getMostPurchased(limit: number = 5): { name: string, count: number }[] {
    const counts: Record<string, number> = {};
    this.purchaseHistory.forEach(h => {
      counts[h.name] = (counts[h.name] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Suggests insights based on current data.
   */
  getInsights(): string[] {
    const insights: string[] = [];
    const stagnant = this.getStagnantItems();
    const mostPurchased = this.getMostPurchased(3);

    if (stagnant.length > 0) {
      insights.push(`You have ${stagnant.length} stagnant items. Consider a 'Use it or Lose it' recipe!`);
    }

    if (mostPurchased.length > 0) {
      insights.push(`Your top items are: ${mostPurchased.map(i => i.name).join(', ')}.`);
    }

    return insights;
  }
}
