import { accessGrants, organizations } from "@/lib/data";
import { NextResponse } from "next/server";

// ♻️ Precompute organization map ONCE (module scoped — not per-request)
const orgMap = new Map(
  organizations.map((org) => [org.id, { id: org.id, name: org.name }])
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Extract params
  const userAddressParam = searchParams.get("userAddress");
  const organizationIdParam = searchParams.get("organizationId");

  // Normalize user address once for comparison
  const normalizedUser = userAddressParam?.toLowerCase();

  // Filter + enrich in a single pass
  const result = accessGrants
    .filter((grant) => {
      const matchesUser = normalizedUser
        ? grant.userAddress.toLowerCase() === normalizedUser
        : true;

      const matchesOrg = organizationIdParam
        ? grant.organizationId === organizationIdParam
        : true;

      return matchesUser && matchesOrg;
    })
    .map((grant) => ({
      ...grant,
      organization: orgMap.get(grant.organizationId) ?? null,
    }));

  // Return JSON response
  return NextResponse.json({
    count: result.length,
    data: result,
  });
}
