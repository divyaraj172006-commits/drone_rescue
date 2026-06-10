export function allocateResources(severity, victimCount = 0) {
  let ambulances = 0;
  let rescueTeams = 0;
  let foodKits = 0;
  let medicalSupplies = 0;
  let shelters = 0;

  const count = parseInt(victimCount) || 0;

  // 1. Establish base level recommendations on severity
  switch (severity) {
    case 'critical':
      ambulances = 10;
      rescueTeams = 8;
      foodKits = 500;
      medicalSupplies = 500;
      shelters = 3;
      break;
    case 'high':
      ambulances = 5;
      rescueTeams = 4;
      foodKits = 200;
      medicalSupplies = 200;
      shelters = 1;
      break;
    case 'medium':
      ambulances = 2;
      rescueTeams = 2;
      foodKits = 50;
      medicalSupplies = 50;
      shelters = 0;
      break;
    case 'low':
    default:
      ambulances = 1;
      rescueTeams = 1;
      foodKits = 10;
      medicalSupplies = 10;
      shelters = 0;
      break;
  }

  // 2. Adjust resource scaling based on victim count
  if (count > 0) {
    ambulances += Math.ceil(count / 5); // 1 ambulance for every 5 victims
    rescueTeams += Math.ceil(count / 8); // 1 rescue team for every 8 victims
    foodKits += count * 2;              // 2 food kits per victim
    medicalSupplies += count * 2;        // 2 medical kits per victim
    shelters += Math.floor(count / 20); // 1 shelter per 20 victims (minimum)
  }

  return {
    ambulances,
    rescueTeams,
    foodKits,
    medicalSupplies,
    shelters,
    calculationExplanation: `Allocated baseline resources for a ${severity.toUpperCase()} severity incident, with escalations applied for ${count} estimated victims (+1 ambulance/5 victims, +1 rescue team/8 victims, +2 food/medical kits per victim).`
  };
}
