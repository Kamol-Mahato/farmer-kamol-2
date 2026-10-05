// অর্ডার ডিলিট হলেও যেন লাইফটাইম কালেকশন না কমে — তাই আলাদা কাউন্টার
// delta = নতুন collectedAmount - আগের collectedAmount (null হলে 0), তাই একই অর্ডার বারবার আপডেট হলেও দুইবার গোনা হয় না
export async function addToLifetimeCollected(
    tx: any,
    newAmount: number,
    oldAmount: number | null | undefined,
  ) {
    const delta = Number(newAmount) - Number(oldAmount ?? 0);
    if (!delta || isNaN(delta)) return;
    await tx.lifetimeStats.upsert({
      where: { id: 1 },
      update: { totalCollected: { increment: delta } },
      create: { id: 1, totalCollected: delta },
    });
  }