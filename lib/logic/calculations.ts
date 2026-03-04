import { ChargingSession, SessionWithCalculations } from '../types/session';

export const calculations = {
  calculateRmPerKwh(costRm: number, kwh: number): number {
    if (kwh === 0) return 0;
    return costRm / kwh;
  },

  calculateWhPerKm(kwh: number, distanceKm: number): number {
    if (distanceKm === 0) return 0;
    return (kwh * 1000) / distanceKm;
  },

  calculateCostPer100km(costRm: number, distanceKm: number): number {
    if (distanceKm === 0) return 0;
    return (costRm / distanceKm) * 100;
  },

  /**
   * Enriches sessions with efficiency metrics.
   * Assumes sessions are sorted by date ascending for calculation.
   */
  enrichSessions(sessions: ChargingSession[]): SessionWithCalculations[] {
    // Sort by date ascending to calculate deltas
    const sorted = [...sessions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime() || 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const enriched = sorted.map((session, index) => {
      const prevSession = index > 0 ? sorted[index - 1] : null;
      const distanceKm = prevSession ? session.odometer_km - prevSession.odometer_km : 0;
      
      const rm_per_kwh = this.calculateRmPerKwh(session.cost_rm, session.kwh);
      let efficiency_status: 'calculated' | 'first_session' | 'odometer_not_increasing' = 'calculated';
      let efficiency_note: string | null = null;
      
      // We only calculate efficiency if we have a previous odometer reading and distance is positive
      const wh_per_km = distanceKm > 0 ? this.calculateWhPerKm(session.kwh, distanceKm) : null;
      const cost_per_100km = distanceKm > 0 ? this.calculateCostPer100km(session.cost_rm, distanceKm) : null;

      if (!prevSession) {
        efficiency_status = 'first_session';
        efficiency_note = 'Initial log';
      } else if (distanceKm <= 0) {
        efficiency_status = 'odometer_not_increasing';
        efficiency_note = 'Invalid odometer';
      }

      return {
        ...session,
        rm_per_kwh,
        wh_per_km,
        cost_per_100km,
        efficiency_status,
        efficiency_note
      };
    });

    // Return in original requested order (descending)
    return enriched.reverse();
  },

  calculateVehicleStats(enrichedSessions: SessionWithCalculations[]) {
    if (enrichedSessions.length === 0) return null;

    const totalKwh = enrichedSessions.reduce((sum, s) => sum + s.kwh, 0);
    const totalCost = enrichedSessions.reduce((sum, s) => sum + s.cost_rm, 0);
    
    // Average efficiency (only for sessions where we could calculate it)
    const sessionsWithEfficiency = enrichedSessions.filter(s => s.wh_per_km !== null);
    const avgWhPerKm = sessionsWithEfficiency.length > 0
      ? sessionsWithEfficiency.reduce((sum, s) => sum + (s.wh_per_km || 0), 0) / sessionsWithEfficiency.length
      : null;

    return {
      totalKwh,
      totalCost,
      avgRmPerKwh: totalCost / totalKwh,
      avgWhPerKm,
      sessionCount: enrichedSessions.length
    };
  }
};
