import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import { PERMISSIONS, ROLE_PERMISSIONS } from "../src/lib/auth/permissions";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(9 + (days % 8), (days * 7) % 59, 0, 0);
  return d;
}

let BIZ_ID = "";

async function genDocNo(prefix: string): Promise<string> {
  const c = await prisma.counter.upsert({
    where: { prefix_businessId: { prefix, businessId: BIZ_ID } },
    update: { sequence: { increment: 1 } },
    create: { prefix, sequence: 1, businessId: BIZ_ID },
  });
  return `${prefix}-${String(c.sequence).padStart(4, "0")}`;
}

const PH_COMPANIES = [
  "ABC Manufacturing Corp","BrightPath Solutions Inc","Nexus Technologies PH","Metro Builders & Construction","Prime Logistics Co",
  "Summit Trading Corp","Golden Harvest Foods","Silverline Electronics","Crown Steel Industries","Emerald Pharma Distributors",
  "Sunrise Property Devt","Vertex IT Solutions","Pacific Marine Supply","Continental Hardware","Stellar Communications",
  "Liberty Freight Systems","Horizon Agribusiness","Pinnacle Construction Supply","Crystal Waters Bottling","Maple Business Solutions",
  "Unity Express Cargo","Zenith Industrial Sales","Evergreen Farms Corp","Falcon Security Systems","Crystal Clear Telecom",
  "Diamond Bank Technologies","Anchor Shipbuilding","Red Dragon Trading","Blue Whale Fisheries","Green Valley Resorts",
  "Thunderbird Electronics","White Lion Distributors","Skyline Architects Inc","Rainbow Paint Mfg","Iron Forge Metalworks",
  "Coral Reef Seafood","Tiger Transport Inc","Eagle Eye Surveillance","Panda Express Logistics","Dolphin Maritime",
  "Starlight Events Mgmt","Cosmos Data Systems","Infinity Network Sol","Cascade Water Tech","Phoenix Energy Corp",
  "Atlas Equipment Rental","Velvet Interior Design","Onyx Mining Corp","Sapphire Jewellery","Marble Stone Quarries",
];

const PRODUCTS = [
  { name: "Enterprise CRM License (per user/year)", price: 19600, category: "Software" },
  { name: "Professional CRM License (per user/year)", price: 10080, category: "Software" },
  { name: "Starter CRM License (per user/year)", price: 4200, category: "Software" },
  { name: "API Access Add-on (annual)", price: 67200, category: "Software" },
  { name: "Cloud Storage Upgrade (1TB/year)", price: 45000, category: "Software" },
  { name: "Mobile App License (per device/year)", price: 8400, category: "Software" },
  { name: "Workflow Automation Module", price: 125000, category: "Software" },
  { name: "Document Management Add-on", price: 95000, category: "Software" },
  { name: "E-Signature Integration", price: 55000, category: "Software" },
  { name: "Custom Integration Development", price: 280000, category: "Service" },
  { name: "Onboarding & Training Package", price: 280000, category: "Service" },
  { name: "Premium Support (24/7, annual)", price: 448000, category: "Service" },
  { name: "Standard Support (annual)", price: 168000, category: "Service" },
  { name: "SSO/SAML Configuration", price: 168000, category: "Service" },
  { name: "Data Migration Service", price: 140000, category: "Service" },
  { name: "Annual Maintenance Contract", price: 672000, category: "Service" },
  { name: "User Training Session", price: 112000, category: "Service" },
  { name: "Backup & Recovery Service (annual)", price: 85000, category: "Service" },
  { name: "Custom Report Development", price: 75000, category: "Service" },
  { name: "Performance Optimization", price: 145000, category: "Service" },
  { name: "Business Process Consulting", price: 250000, category: "Consulting" },
  { name: "Digital Transformation Workshop", price: 180000, category: "Consulting" },
  { name: "Cybersecurity Assessment", price: 220000, category: "Consulting" },
  { name: "System Health Audit", price: 95000, category: "Consulting" },
  { name: "Compliance Audit Preparation", price: 165000, category: "Consulting" },
];

const CITIES = [
  { city: "Makati City", state: "Metro Manila", zip: "1226", street: "Ayala Avenue" },
  { city: "Taguig City", state: "Metro Manila", zip: "1634", street: "31st Street" },
  { city: "Pasig City", state: "Metro Manila", zip: "1605", street: "ADB Avenue" },
  { city: "Quezon City", state: "Metro Manila", zip: "1100", street: "Commonwealth Avenue" },
  { city: "Mandaluyong City", state: "Metro Manila", zip: "1550", street: "Shaw Boulevard" },
  { city: "Cebu City", state: "Cebu", zip: "6000", street: "Osmeña Boulevard" },
  { city: "Davao City", state: "Davao del Sur", zip: "8000", street: "JP Laurel Avenue" },
  { city: "Iloilo City", state: "Iloilo", zip: "5000", street: "Diversion Road" },
];

async function main() {
  console.log("Seeding comprehensive demo data...\n");

  for (const code of PERMISSIONS) await prisma.permission.upsert({ where: { code }, update: {}, create: { code, description: code } });
  for (const [roleName, permCodes] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({ where: { name: roleName }, update: {}, create: { name: roleName, description: `${roleName} role` } });
    for (const code of permCodes) { const p = await prisma.permission.findUnique({ where: { code } }); if (p) await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } }, update: {}, create: { roleId: role.id, permissionId: p.id } }); }
  }

  await prisma.businessUser.deleteMany();
  await prisma.business.deleteMany();
  const defaultBiz = await prisma.business.create({ data: { name: "Apex Business Solutions" } });
  const demoBiz = await prisma.business.create({ data: { name: "Apex Logistics" } });
  const bizId = defaultBiz.id;
  BIZ_ID = bizId;
  console.log(`Businesses: 2 (${defaultBiz.name}, ${demoBiz.name})`);

  const defaultSettings = [{ key: "company_name", value: "CRM Sales Inc.", category: "general" },{ key: "default_currency", value: "PHP", category: "general" },{ key: "tax_rate", value: "0.12", category: "tax" },{ key: "payment_terms_days", value: "30", category: "general" },{ key: "onboarding_complete", value: "true", category: "system" }];
  for (const s of defaultSettings) await prisma.setting.upsert({ where: { key_businessId: { key: s.key, businessId: bizId } }, update: {}, create: { ...s, businessId: bizId } });
  await prisma.setting.upsert({ where: { key_businessId: { key: "onboarding_complete", businessId: demoBiz.id } }, update: {}, create: { key: "onboarding_complete", value: "true", category: "system", businessId: demoBiz.id } });

  const adminRole = (await prisma.role.findUnique({ where: { name: "Admin" } }))!;
  const repRole = (await prisma.role.findUnique({ where: { name: "Sales Rep" } }))!;
  const mgrRole = (await prisma.role.findUnique({ where: { name: "Sales Manager" } }))!;

  const userData = [
    { name: "System Admin", email: "admin@crm.local", roleId: adminRole.id },
    { name: "John Cruz", email: "john.cruz@crm.local", roleId: repRole.id },
    { name: "Maria Santos", email: "maria.santos@crm.local", roleId: repRole.id },
    { name: "Carlos Reyes", email: "carlos.reyes@crm.local", roleId: mgrRole.id },
  ];
  const userIds: Record<string,string> = {};
  for (const u of userData) {
    let user = await prisma.user.findUnique({ where: { email: u.email } });
    if (!user) user = await prisma.user.create({ data: { name: u.name, email: u.email, passwordHash: bcrypt.hashSync("password123", 12), roleRoleId: u.roleId, status: "ACTIVE" } });
    userIds[u.email] = user.id;
  }
  const [adminId, rep1Id, rep2Id, mgrId] = ["admin@crm.local","john.cruz@crm.local","maria.santos@crm.local","carlos.reyes@crm.local"].map(e => userIds[e]);
  const repIds = [rep1Id, rep2Id];
  for (const uid of [adminId, rep1Id, rep2Id, mgrId]) {
    await prisma.businessUser.create({ data: { businessId: bizId, userId: uid } });
  }
  await prisma.businessUser.create({ data: { businessId: demoBiz.id, userId: adminId } });
  console.log(`Users: 4, Business assignments: 5`);

  await prisma.product.deleteMany();
  for (const p of PRODUCTS) await prisma.product.create({ data: { businessId: bizId, name: p.name, description: p.name, defaultPrice: p.price, category: p.category, isActive: true } });
  const allProducts = await prisma.product.findMany();
  console.log(`Products: ${allProducts.length}`);

  const FNS = ["Juan","Maria","Jose","Ana","Pedro","Rosa","Carlos","Liza","Ramon","Cristina","Fernando","Grace","Antonio","Cherry","Eduardo","Diana"];
  const LNS = ["Cruz","Santos","Reyes","Garcia","Mendoza","Torres","Lim","Aquino","Navarro","Domingo","Villanueva","Pascual","Bautista","Gonzales","Tan","Ocampo"];
  const sources = ["WEBSITE","REFERRAL","COLD_CALL","EVENT","OTHER"];
  const titles = ["CEO","CTO","VP Operations","IT Director","Procurement Head"];

  await prisma.payment.deleteMany(); await prisma.salesInvoiceItem.deleteMany(); await prisma.salesInvoice.deleteMany();
  await prisma.deliveryNoteItem.deleteMany(); await prisma.deliveryNote.deleteMany();
  await prisma.salesOrderItem.deleteMany(); await prisma.salesOrder.deleteMany();
  await prisma.quotationItem.deleteMany(); await prisma.quotation.deleteMany();
  await prisma.customerContact.deleteMany(); await prisma.customerAddress.deleteMany(); await prisma.customer.deleteMany();
  await prisma.opportunity.deleteMany(); await prisma.lead.deleteMany(); await prisma.auditLog.deleteMany();
  await prisma.message.deleteMany(); await prisma.conversationParticipant.deleteMany(); await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.counter.updateMany({ data: { sequence: 0 } });

  let leadCount = 0;
  const qualified: {id:string;company:string;repId:string;email:string|null;phone:string|null}[] = [];
  for (let i = 0; i < PH_COMPANIES.length; i++) {
    const company = PH_COMPANIES[i];
    const fn = FNS[i % FNS.length], ln = LNS[i % LNS.length];
    const repId = repIds[i % 2];
    const ageDays = 170 - Math.floor((i / PH_COMPANIES.length) * 165);
    const created = daysAgo(ageDays);
    const status = i < 4 ? "NEW" : i < 10 ? "CONTACTED" : i < 40 ? "QUALIFIED" : "DISQUALIFIED";
    const slug = company.toLowerCase().replace(/[^a-z]/g,"").slice(0,12);
    const lead = await prisma.lead.create({ data: { businessId: bizId,
      documentNo: await genDocNo("LEAD"), firstName: fn, lastName: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${slug}.com.ph`,
      phone: `+63 917 ${String(5000000+i*137).slice(0,3)} ${String(4000+i*11).slice(0,4)}`,
      company, jobTitle: titles[i%5], source: sources[i%sources.length], status,
      assignedToId: repId, createdById: adminId,
      notes: status==="QUALIFIED"?"Budget confirmed. Ready for proposal.":status==="DISQUALIFIED"?"Went with competitor.":undefined,
      createdAt: created, updatedAt: created,
    }});
    leadCount++;
    if (status==="QUALIFIED") qualified.push({id:lead.id,company,email:lead.email,phone:lead.phone,repId});
  }
  console.log(`Leads: ${leadCount} (${qualified.length} qualified)`);

  const oppsWon: {company:string;repId:string;leadId:string}[] = [];
  const stages = ["PROSPECTING","QUALIFICATION","NEEDS_ANALYSIS","VALUE_PROPOSITION","NEGOTIATION"];
  for (let i = 0; i < qualified.length; i++) {
    const lead = qualified[i];
    const created = daysAgo(150 - Math.floor((i/qualified.length)*140));
    const closeDate = new Date(created.getTime()+30*86400000);
    const isWon = i < 22, isLost = i >= 22 && i < 26;
    const value = 50000 + (i*37000)%1800000;
    await prisma.opportunity.create({ data: { businessId: bizId,
      documentNo: await genDocNo("OPP"), leadId: lead.id,
      title: `${lead.company} — CRM Solution`, description: `${lead.company} requires CRM implementation.`,
      estimatedValue: value, expectedCloseDate: closeDate,
      stage: isWon ? "NEGOTIATION" : stages[Math.min(Math.floor(i/8),4)],
      status: isWon ? "CLOSED_WON" : isLost ? "CLOSED_LOST" : "OPEN",
      lossReason: isLost ? "Competitor won the deal" : null,
      assignedToId: lead.repId, createdById: adminId, createdAt: created, updatedAt: created,
    }});
    if (isWon) oppsWon.push({company:lead.company,repId:lead.repId,leadId:lead.id});
  }
  console.log(`Opportunities: ${qualified.length} (${oppsWon.length} won)`);

  const acceptedQuotes: {company:string;repId:string;leadId:string;items:{d:string;q:number;p:number;dp:number}[]}[] = [];
  for (let i = 0; i < oppsWon.length; i++) {
    const opp = oppsWon[i];
    const created = daysAgo(110 - Math.floor((i/oppsWon.length)*100));
    const numItems = 2 + (i%3);
    const items:{d:string;q:number;p:number;dp:number}[] = [];
    for (let j = 0; j < numItems; j++) { const prod = allProducts[(i*3+j)%allProducts.length]; items.push({d:prod.name,q:prod.category==="Software"?5+j*10:1,p:Number(prod.defaultPrice),dp:j===0?5:0}); }
    const status = i < 18 ? "ACCEPTED" : i < 20 ? "SENT" : "REJECTED";
    const lt = items.map(it=>Math.round(it.q*it.p*(1-it.dp/100)*100)/100);
    const sub = Math.round(lt.reduce((a,b)=>a+b,0)*100)/100;
    const tax = Math.round(sub*0.12*100)/100;
    const gt = Math.round((sub+tax)*100)/100;
    const q = await prisma.quotation.create({ data: { businessId: bizId,
      documentNo: await genDocNo("QUO"), opportunityId: (await prisma.opportunity.findFirst({where:{title:{contains:opp.company}},orderBy:{createdAt:"desc"}}))!.id,
      status, subject: `${opp.company} — Proposal`, validUntil: new Date(created.getTime()+30*86400000),
      currency: "PHP", subtotal: sub, discountTotal: 0, taxRate: 0.12, taxTotal: tax, grandTotal: gt,
      createdById: opp.repId, createdAt: created, updatedAt: created,
      items: { create: items.map((it,k)=>({description:it.d,quantity:it.q,unitPrice:it.p,discountPercent:it.dp,lineTotal:lt[k]})) },
    }});
    if (status==="ACCEPTED") acceptedQuotes.push({company:opp.company,repId:opp.repId,leadId:opp.leadId,items});
  }
  console.log(`Quotations: ${oppsWon.length} (${acceptedQuotes.length} accepted)`);

  const customers: {id:string;name:string;terms:number;repId:string}[] = [];
  for (let i = 0; i < acceptedQuotes.length; i++) {
    const q = acceptedQuotes[i]; const created = daysAgo(90-Math.floor((i/acceptedQuotes.length)*80));
    const city = CITIES[i%CITIES.length]; const slug = q.company.toLowerCase().replace(/[^a-z]/g,"").slice(0,12);
    const cust = await prisma.customer.create({ data: { businessId: bizId,
      documentNo: await genDocNo("CUST"), name: q.company, email: `finance@${slug}.com.ph`,
      phone: `+63 2 8${String(5000000+i*1337).slice(0,7)}`, taxId: `${String(100+i).padStart(3,"0")}-${String(200+i).padStart(3,"0")}-${String(300+i).padStart(3,"0")}-000`,
      website: `www.${slug}.com.ph`, status: "ACTIVE", creditLimit: 5000000,
      paymentTerms: i%3===0?15:i%3===1?30:45, leadId: q.leadId, createdById: adminId, createdAt: created, updatedAt: created,
      addresses: { create: [
        { type:"BILLING", line1:`${10+i*5} ${city.street}`, line2:`Floor ${5+i%20}`, city:city.city, state:city.state, postalCode:city.zip, country:"Philippines" },
        { type:"SHIPPING", line1:`${20+i*3} Warehouse Rd`, city:city.city, state:city.state, postalCode:city.zip, country:"Philippines" },
      ]},
      contacts: { create: [{ name:`${FNS[i%16]} ${LNS[i%16]}`, email:`ap@${slug}.com.ph`, phone:`+63 917 ${String(5000000+i).slice(0,7)}`, jobTitle:"Finance Manager", isPrimary:true }] },
    }});
    customers.push({id:cust.id,name:q.company,terms:cust.paymentTerms,repId:q.repId});
  }
  for (let i = 0; i < 3; i++) {
    const city = CITIES[i+5]; const name = ["Apex Global Inc","Titan Industries","Meridian Corp"][i];
    const cust = await prisma.customer.create({ data: { businessId: bizId, documentNo: await genDocNo("CUST"), name, email:`info@${name.toLowerCase().replace(/[^a-z]/g,"")}.com`, phone:"+63 2 8444 1000", status:"ACTIVE", creditLimit:3000000, paymentTerms:30, createdById:adminId,
      addresses:{create:[{type:"BILLING",line1:"100 Corporate Center",city:city.city,state:city.state,postalCode:city.zip,country:"Philippines"}]} }});
    customers.push({id:cust.id,name,terms:30,repId:repIds[i%2]});
  }
  console.log(`Customers: ${customers.length}`);

  const sos: {id:string;custId:string;custName:string;grandTotal:number;taxRate:number;status:string;terms:number;repId:string;items:{d:string;q:number;p:number;dp:number}[]}[] = [];
  for (let i = 0; i < customers.length; i++) {
    const cust = customers[i]; const created = daysAgo(75-Math.floor((i/customers.length)*65));
    const numItems = 2+(i%3);
    const items:{d:string;q:number;p:number;dp:number}[] = [];
    for (let j=0;j<numItems;j++){const prod=allProducts[(i*5+j*7)%allProducts.length];items.push({d:prod.name,q:prod.category==="Software"?10+j*5:1,p:Number(prod.defaultPrice),dp:(j*5)%15});}
    const lt = items.map(it=>Math.round(it.q*it.p*(1-it.dp/100)*100)/100);
    const sub = Math.round(lt.reduce((a,b)=>a+b,0)*100)/100;
    const tax = Math.round(sub*0.12*100)/100;
    const gt = Math.round((sub+tax)*100)/100;
    const status = i<12?"COMPLETED":i<17?"DELIVERED":i<19?"FULFILLING":"CONFIRMED";
    const so = await prisma.salesOrder.create({ data: { businessId: bizId,
      documentNo: await genDocNo("SO"), customerId: cust.id, status,
      orderDate: created, expectedDeliveryDate: new Date(created.getTime()+14*86400000),
      subtotal: sub, discountTotal: 0, taxRate: 0.12, taxTotal: tax, grandTotal: gt,
      createdById: cust.repId, createdAt: created, updatedAt: created,
      items: { create: items.map((it,k)=>({description:it.d,quantity:it.q,unitPrice:it.p,discountPercent:it.dp,lineTotal:lt[k],deliveredQuantity:["COMPLETED","DELIVERED"].includes(status)?it.q:status==="FULFILLING"?Math.floor(it.q*0.5):0})) },
    }});
    sos.push({id:so.id,custId:cust.id,custName:cust.name,grandTotal:gt,taxRate:0.12,status,terms:cust.terms,repId:cust.repId,items});
  }
  console.log(`Sales Orders: ${sos.length}`);

  let dnCount = 0;
  for (let i = 0; i < sos.length; i++) {
    const so = sos[i]; if (!["COMPLETED","DELIVERED","FULFILLING"].includes(so.status)) continue;
    const created = daysAgo(65-i*3);
    const soItems = await prisma.salesOrderItem.findMany({where:{salesOrderId:so.id,deletedAt:null}});
    const delItems = soItems.filter(it=>Number(it.quantity)-Number(it.deliveredQuantity)>0);
    if (!delItems.length) continue;
    const carriers = ["LBC Express","JRS Express","2GO Logistics","Air21"];
    const status = so.status==="COMPLETED"?"ACKNOWLEDGED":so.status==="DELIVERED"?"DELIVERED":"DISPATCHED";
    await prisma.deliveryNote.create({ data: { businessId: bizId,
      documentNo: await genDocNo("DN"), salesOrderId: so.id, status,
      deliveryDate: status!=="DISPATCHED"?new Date(created.getTime()+2*86400000):null,
      carrier: carriers[i%4], trackingNumber: `${carriers[i%4].split(" ")[0]}-${500000+i*137}`,
      createdById: adminId, createdAt: created,
      items: { create: delItems.map(it=>({salesOrderItemId:it.id,description:it.description,quantity:Number(it.deliveredQuantity)>0?Number(it.deliveredQuantity):Number(it.quantity)})) },
    }});
    dnCount++;
  }
  console.log(`Delivery Notes: ${dnCount}`);

  let invCount = 0, payCount = 0;
  const monthlyRev = new Map<string,number>();
  for (let i = 0; i < sos.length; i++) {
    const so = sos[i]; if (!["COMPLETED","DELIVERED","FULFILLING"].includes(so.status)) continue;
    const created = daysAgo(60-i*3);
    const dueDate = new Date(created.getTime()+so.terms*86400000);
    let invStatus = "OPEN", paidAmt = 0, paidAt: Date|null = null;
    if (so.status==="COMPLETED"&&i<10){invStatus="PAID";paidAmt=so.grandTotal;paidAt=new Date(created.getTime()+5*86400000);}
    else if(so.status==="COMPLETED"&&i<12){invStatus="PAID";paidAmt=so.grandTotal;paidAt=new Date(created.getTime()+3*86400000);}
    else if(i<15){invStatus="PARTIALLY_PAID";paidAmt=Math.round(so.grandTotal*0.5*100)/100;paidAt=new Date(created.getTime()+7*86400000);}
    else if(dueDate<new Date()){invStatus="OVERDUE";}
    const cust = await prisma.customer.findUnique({where:{id:so.custId},include:{addresses:{where:{type:"BILLING"}}}});
    const b = cust?.addresses[0];
    const inv = await prisma.salesInvoice.create({ data: { businessId: bizId,
      documentNo: await genDocNo("INV"), salesOrderId: so.id, customerId: so.custId,
      customerName: so.custName, customerEmail: cust?.email, customerPhone: cust?.phone,
      customerAddress: b?[b.line1,b.line2,b.city,b.state,b.postalCode,b.country].filter(Boolean).join(", "):null,
      status: invStatus, issueDate: created, dueDate, currency: "PHP",
      subtotal: Math.round(so.grandTotal/1.12*100)/100, discountTotal: 0, taxRate: 0.12,
      taxTotal: Math.round((so.grandTotal-so.grandTotal/1.12)*100)/100, grandTotal: so.grandTotal,
      paidAmount: paidAmt, paidAt, createdById: adminId, createdAt: created,
      items: { create: so.items.map(it=>({description:it.d,quantity:it.q,unitPrice:it.p,discountPercent:it.dp,lineTotal:Math.round(it.q*it.p*(1-it.dp/100)*100)/100})) },
    }});
    invCount++;
    if (paidAmt > 0) {
      const pd = paidAt ?? created;
      const mk = `${pd.getFullYear()}-${String(pd.getMonth()+1).padStart(2,"0")}`;
      const methods = ["BANK_TRANSFER","GCASH","CHECK","CASH"];
      await prisma.payment.create({ data: { businessId: bizId,
        documentNo: await genDocNo("PAY"), salesInvoiceId: inv.id, customerId: so.custId, customerName: so.custName,
        amount: paidAmt, paymentMethod: methods[i%4], referenceNumber: `REF-${500000+i*99}`,
        paymentDate: pd, status: "RECEIVED", notes: paidAmt>=so.grandTotal?"Full payment.":"50% deposit.",
        receivedById: i%2===0?mgrId:adminId, createdAt: pd,
      }});
      payCount++;
      monthlyRev.set(mk,(monthlyRev.get(mk)??0)+paidAmt);
    }
    if (invStatus==="PARTIALLY_PAID"&&i%3===0) {
      const pd2 = new Date(created.getTime()+20*86400000);
      const rem = so.grandTotal-paidAmt;
      const mk2 = `${pd2.getFullYear()}-${String(pd2.getMonth()+1).padStart(2,"0")}`;
      await prisma.payment.create({ data: { businessId: bizId,
        documentNo: await genDocNo("PAY"), salesInvoiceId: inv.id, customerId: so.custId, customerName: so.custName,
        amount: rem, paymentMethod: "BANK_TRANSFER", referenceNumber: `REF-${600000+i*77}`,
        paymentDate: pd2, status: "RECEIVED", notes: "Balance payment.", receivedById: mgrId, createdAt: pd2,
      }});
      payCount++;
      monthlyRev.set(mk2,(monthlyRev.get(mk2)??0)+rem);
      await prisma.salesInvoice.update({where:{id:inv.id},data:{paidAmount:so.grandTotal,status:"PAID",paidAt:pd2}});
    }
  }
  console.log(`Invoices: ${invCount}, Payments: ${payCount}`);

  const entities = ["Lead","Opportunity","Quotation","Customer","SalesOrder","SalesInvoice","Payment"];
  const actions = ["CREATE","UPDATE","DELETE","TRANSITION"];
  const uids = [adminId,rep1Id,rep2Id,mgrId];
  for (let i = 0; i < 200; i++) {
    await prisma.auditLog.create({ data: { businessId: bizId,
      entityType: entities[i%entities.length], entityId: `seed-${i}`,
      action: actions[i%actions.length], userId: uids[i%uids.length],
      newState: { note: `Demo ${actions[i%actions.length]} ${entities[i%entities.length]}` },
      createdAt: daysAgo(Math.floor((i/200)*170)),
    }});
  }
  console.log(`Audit Logs: 200`);

  const dm1 = await prisma.conversation.create({ data: { businessId: bizId, isGroup: false, participants: { create: [{ userId: mgrId, lastReadAt: daysAgo(0) }, { userId: rep1Id, lastReadAt: daysAgo(1) }] } } });
  const m1a = new Date(daysAgo(1).getTime() + 2 * 3600000);
  const m1b = new Date(m1a.getTime() + 5 * 60000);
  await prisma.message.create({ data: { conversationId: dm1.id, senderId: rep1Id, content: "Hi Carlos, got a question about the Apex lead.", createdAt: m1a } });
  await prisma.message.create({ data: { conversationId: dm1.id, senderId: mgrId, content: "Sure John, what do you need?", createdAt: m1b } });
  await prisma.conversation.update({ where: { id: dm1.id }, data: { lastMessageAt: m1b } });

  const grp = await prisma.conversation.create({ data: { businessId: bizId, isGroup: true, name: "Sales Team", createdById: mgrId, participants: { create: [{ userId: mgrId, lastReadAt: daysAgo(0) }, { userId: rep1Id, lastReadAt: daysAgo(0) }, { userId: rep2Id, lastReadAt: daysAgo(1) }, { userId: adminId, lastReadAt: daysAgo(2) }] } } });
  const g1 = new Date(daysAgo(2).getTime() + 3 * 3600000);
  const g2 = new Date(g1.getTime() + 10 * 60000);
  const g3 = new Date(g2.getTime() + 8 * 60000);
  await prisma.message.create({ data: { conversationId: grp.id, senderId: mgrId, content: "Team, let's sync on the Q3 pipeline targets this week.", createdAt: g1 } });
  await prisma.message.create({ data: { conversationId: grp.id, senderId: rep2Id, content: "I'm free Thursday afternoon.", createdAt: g2 } });
  await prisma.message.create({ data: { conversationId: grp.id, senderId: rep1Id, content: "Thursday works for me too.", createdAt: g3 } });
  await prisma.conversation.update({ where: { id: grp.id }, data: { lastMessageAt: g3 } });
  console.log(`Conversations: 2 (1 direct + 1 group), Messages: 5`);

  const notifBase = [
    { userId: adminId, type: "payment_received", title: "Payment Received", message: "₱1,000,000 received for INV-0001 (Pacific Marine Supply)", readAt: null, ago: 0.02 },
    { userId: adminId, type: "customer_created", title: "New Customer", message: "Diamond Bank Technologies (CUST-0003) was added", readAt: null, ago: 0.1 },
    { userId: adminId, type: "quotation_accepted", title: "Quotation Accepted", message: "QUO-0005 was accepted", readAt: daysAgo(1), ago: 1 },
    { userId: adminId, type: "sales_order_created", title: "New Sales Order", message: "SO-0003 (Falcon Security) was created", readAt: daysAgo(2), ago: 2 },
    { userId: mgrId, type: "lead_assigned", title: "Lead Assigned", message: "Juan Cruz (LEAD-0006) was assigned to John Cruz", readAt: null, ago: 0.05 },
    { userId: mgrId, type: "payment_received", title: "Payment Received", message: "₱500,000 received for INV-0003", readAt: null, ago: 0.5 },
    { userId: mgrId, type: "quotation_rejected", title: "Quotation Rejected", message: "QUO-0008 was rejected", readAt: daysAgo(1), ago: 1.5 },
    { userId: rep1Id, type: "lead_assigned", title: "Lead Assigned to You", message: "Maria Garcia (LEAD-0012) was assigned to you", readAt: null, ago: 0.08 },
    { userId: rep1Id, type: "invoice_due_soon", title: "Invoice Due Soon", message: "INV-0016 is due within 3 days", readAt: null, ago: 0.3 },
    { userId: rep1Id, type: "message_received", title: "New Message", message: "Carlos Reyes: Check the Apex lead when you get a chance", readAt: daysAgo(0.5), ago: 0.5 },
    { userId: rep2Id, type: "added_to_group", title: "Added to Group", message: "You were added to \"Sales Team\"", readAt: null, ago: 0.2 },
    { userId: rep2Id, type: "quotation_expiring", title: "Quotation Expiring Soon", message: "QUO-0015 expires within 3 days", readAt: null, ago: 1 },
  ];
  for (const n of notifBase) {
    await prisma.notification.create({ data: { businessId: bizId,
      userId: n.userId, type: n.type, title: n.title, message: n.message,
      entityType: n.type.split("_")[0] === "lead" ? "Lead" : n.type.split("_")[0] === "payment" ? "Payment" : n.type.split("_")[0] === "quotation" ? "Quotation" : n.type.split("_")[0] === "sales" ? "SalesOrder" : n.type.split("_")[0] === "invoice" ? "Invoice" : n.type.split("_")[0] === "customer" ? "Customer" : null,
      entityId: `seed-${n.type}`,
      link: null,
      readAt: n.readAt,
      createdAt: daysAgo(n.ago),
    }});
  }
  console.log(`Notifications: ${notifBase.length}`);

  console.log("\n=== Revenue by Month ===");
  let totalRev = 0;
  for (const [key, amt] of [...monthlyRev.entries()].sort()) {
    const [y,m] = key.split("-");
    console.log(`  ${new Date(Number(y),Number(m)-1,1).toLocaleDateString("en-PH",{month:"short",year:"numeric"})}: ₱${amt.toLocaleString()}`);
    totalRev += amt;
  }
  console.log(`\nTotal: ₱${totalRev.toLocaleString()}\nLogin: admin@crm.local / password123 (or any user / password123)`);
  await prisma.$disconnect();
}
main().catch(e=>{console.error(e);process.exit(1);});
