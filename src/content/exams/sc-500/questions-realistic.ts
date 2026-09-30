import type { Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

/**
 * Exam-style questions: RBAC and governance traps where the obvious answer is wrong,
 * plus long scenarios with several competing requirements. Every behaviour tested
 * here is documented on Microsoft Learn.
 */
export const sc500RealisticQuestions: Question[] = [
  // ------------------------------------------------------------ RBAC traps
  {
    id: "sc500-t1",
    domainId: "identity",
    type: "single",
    prompt:
      "Priya has just been assigned the Global Administrator role in Microsoft Entra ID. When she opens the Azure portal she sees none of the tenant's subscriptions. What is the correct way to let her manage all subscriptions and management groups?",
    options: [
      { id: "a", text: "Nothing is needed, because Global Administrator automatically holds Owner on every subscription in the tenant" },
      { id: "b", text: "Elevate her access, which assigns User Access Administrator at root scope, then grant the roles she needs" },
      { id: "c", text: "Assign her the Owner role on the tenant root group from the Microsoft Entra roles blade" },
      { id: "d", text: "Add her to the classic Co-Administrator role on each subscription one at a time" },
    ],
    correct: ["b"],
    explanation:
      "Entra roles and Azure roles are separate systems, so a Global Administrator does not automatically have Azure access. Elevating access assigns the User Access Administrator role at root scope (/), from where she can assign herself whatever roles she needs. The Entra roles blade cannot grant Azure roles, and classic administrator roles are legacy.",
    difficulty: 2,
    reference: { label: "Elevate access to manage all Azure subscriptions and management groups", url: `${docs}/azure/role-based-access-control/elevate-access-global-admin` },
  },
  {
    id: "sc500-t2",
    domainId: "identity",
    type: "single",
    prompt:
      "An engineer is Owner of a storage account. In the Azure portal, with Microsoft Entra user account selected as the authentication method, browsing the account's blobs fails with an authorization error. What explains this and what fixes it?",
    options: [
      { id: "a", text: "Owner grants no blob data access through Entra, so assign a data role such as Storage Blob Data Reader" },
      { id: "b", text: "Role assignments can take up to a day to apply, so waiting for propagation is enough" },
      { id: "c", text: "Owner is read-only at the data plane, so the engineer needs to be changed to Contributor" },
      { id: "d", text: "The portal never allows Entra authorization for blob data, so an account key must be used instead" },
    ],
    correct: ["a"],
    explanation:
      "Built-in roles such as Owner, Contributor and Storage Account Contributor allow managing the storage account but do not provide access to blob data through Microsoft Entra authorization. Only roles that define data actions, such as Storage Blob Data Reader, Contributor or Owner, grant it.",
    difficulty: 2,
    reference: { label: "Authorize access to blob data with Microsoft Entra ID", url: `${docs}/azure/storage/blobs/authorize-access-azure-active-directory` },
  },
  {
    id: "sc500-t3",
    domainId: "identity",
    type: "single",
    prompt:
      "A key vault uses the access policy permission model. Auditors require that engineers holding Contributor on the resource group must not be able to read secrets. Why does Contributor already allow it, and what should you do?",
    options: [
      { id: "a", text: "Contributor includes data plane rights, so replace it with Owner, which does not include them, for engineers" },
      { id: "b", text: "Contributor can add an access policy for itself, so use Azure RBAC and grant data roles separately" },
      { id: "c", text: "Contributor cannot touch the data plane, so the auditors' requirement is already met by default" },
      { id: "d", text: "Enable purge protection so that engineers can no longer read secret contents from the vault" },
    ],
    correct: ["b"],
    explanation:
      "With access policies, anyone with Contributor on the vault's control plane can grant themselves data plane access by adding an access policy. Using the Azure RBAC permission model separates the planes: Contributor manages the vault, while reading secrets needs a data role such as Key Vault Secrets User, and Contributor cannot assign roles.",
    difficulty: 3,
    reference: { label: "Provide access to Key Vault with Azure RBAC", url: `${docs}/azure/key-vault/general/rbac-guide` },
  },
  {
    id: "sc500-t4",
    domainId: "identity",
    type: "single",
    prompt:
      "A web app uses a managed identity to read secret values from a vault that uses the Azure RBAC permission model. You must apply least privilege. Which role should you assign to the identity?",
    options: [
      { id: "a", text: "Key Vault Reader, which lets the app read secrets and their properties" },
      { id: "b", text: "Key Vault Secrets Officer, which lets the app read and manage secrets" },
      { id: "c", text: "Key Vault Secrets User, which lets the app read secret contents only" },
      { id: "d", text: "Key Vault Administrator, which lets the app perform all data operations" },
    ],
    correct: ["c"],
    explanation:
      "Key Vault Secrets User reads secret contents and nothing more. Key Vault Reader only reads metadata and cannot read secret values or key material, Secrets Officer can also create and delete secrets, and Administrator does everything on the data plane.",
    difficulty: 2,
    reference: { label: "Provide access to Key Vault with Azure RBAC", url: `${docs}/azure/key-vault/general/rbac-guide` },
  },
  {
    id: "sc500-t5",
    domainId: "identity",
    type: "single",
    prompt:
      "Creating a new role assignment in a subscription fails with RoleAssignmentLimitExceeded. Thousands of assignments were made directly to individual users and service principals. Which change frees capacity while adding the least ongoing effort?",
    options: [
      { id: "a", text: "Assign the roles to Microsoft Entra groups instead, then remove the per-principal assignments" },
      { id: "b", text: "Create deny assignments that consolidate access for all of the users who share the same job function" },
      { id: "c", text: "Move each assignment down to individual resources so that resource groups have fewer" },
      { id: "d", text: "Switch the affected users to Global Reader so that no role assignments are required" },
    ],
    correct: ["a"],
    explanation:
      "A subscription supports up to 5000 role assignments, counted across subscription, resource group and resource scopes but not management group scope. Replacing principal-based assignments with group-based ones is the documented way to cut the number. Deny assignments cannot be created directly, and assigning at resource scope increases the count.",
    difficulty: 3,
    reference: { label: "Troubleshoot Azure RBAC limits", url: `${docs}/azure/role-based-access-control/troubleshoot-limits` },
  },
  {
    id: "sc500-t6",
    domainId: "identity",
    type: "single",
    prompt:
      "Resources deployed by a deployment stack must not be deleted or changed by anyone, including subscription owners, until the stack itself is removed. How is this enforced?",
    options: [
      { id: "a", text: "Set deny settings on the stack, which creates a deny assignment owned by the stack" },
      { id: "b", text: "Create a deny assignment directly with a PowerShell command scoped to the resource group" },
      { id: "c", text: "Assign a custom role whose NotActions list all write and delete operations" },
      { id: "d", text: "Apply an Azure Policy with the Deny effect on all delete operations for the group" },
    ],
    correct: ["a"],
    explanation:
      "You cannot create deny assignments yourself, because Azure creates and manages them, but deployment stacks can specify deny settings that produce one. A custom role with NotActions does not block anything, since Azure RBAC is additive and other assignments still grant the actions.",
    difficulty: 3,
    reference: { label: "Understand Azure deny assignments", url: `${docs}/azure/role-based-access-control/deny-assignments` },
  },
  {
    id: "sc500-t7",
    domainId: "identity",
    type: "single",
    prompt:
      "A platform lead must be able to grant only the Backup Reader and Backup Contributor roles, only to the Marketing and Sales groups, and must not be able to grant Owner or any other role. Which combination should you use?",
    options: [
      { id: "a", text: "User Access Administrator at the subscription, since it only manages access to the resources and never the resources themselves" },
      { id: "b", text: "Owner at the resource group, with an Azure Policy that blocks other role assignments" },
      { id: "c", text: "Contributor at the subscription, with a policy exemption for role assignment resources" },
      { id: "d", text: "Role Based Access Control Administrator, with a role assignment condition limiting roles and principals" },
    ],
    correct: ["d"],
    explanation:
      "Role Based Access Control Administrator can be assigned with conditions that restrict which roles it may assign and to which principals, which matches the requirement exactly. User Access Administrator can assign any role, and Azure Policy does not govern role assignments made through Azure RBAC.",
    difficulty: 3,
    reference: { label: "Delegate Azure access management with conditions", url: `${docs}/azure/role-based-access-control/delegate-role-assignments-overview` },
  },
  {
    id: "sc500-t8",
    domainId: "identity",
    type: "single",
    prompt:
      "A data platform has 300 blob containers. Each team must read only the containers whose names start with its own prefix. Creating one role assignment per team per container would exceed the subscription's limit. What should you use?",
    options: [
      { id: "a", text: "Storage Account Contributor assignments filtered by resource tags on the account" },
      { id: "b", text: "Storage Blob Data Reader assignments with role assignment conditions on the container name (Azure ABAC)" },
      { id: "c", text: "Reader assignments at subscription scope, combined with per-team storage firewall rules" },
      { id: "d", text: "A deny assignment on every container that does not match the requesting team's prefix" },
    ],
    correct: ["b"],
    explanation:
      "Azure ABAC adds conditions to role assignments based on attributes such as the container name, so one assignment per team can cover many containers and reduce the number of role assignments. Storage Account Contributor and Reader do not grant blob data access, and deny assignments cannot be created directly.",
    difficulty: 3,
    reference: { label: "What is Azure attribute-based access control?", url: `${docs}/azure/role-based-access-control/conditions-overview` },
  },
  {
    id: "sc500-t9",
    domainId: "identity",
    type: "single",
    prompt:
      "You create a custom role that includes DataActions for reading blobs and list your root management group in its AssignableScopes so that every subscription can use it. Creating the role fails. Why, and what should you do?",
    options: [
      { id: "a", text: "Roles with DataActions cannot be assigned at management group scope, so list subscriptions or resource groups" },
      { id: "b", text: "Custom roles cannot contain DataActions at all, so use only Actions and NotActions instead" },
      { id: "c", text: "The root management group only accepts built-in roles, so ask Microsoft to publish yours" },
      { id: "d", text: "AssignableScopes accepts one scope only, so create a separate role for each subscription" },
    ],
    correct: ["a"],
    explanation:
      "A custom role that contains DataActions cannot be assigned at management group scope, so its AssignableScopes must list subscriptions or resource groups instead. Custom roles can contain DataActions, can list more than one scope, and are not published by Microsoft.",
    difficulty: 3,
    reference: { label: "Azure custom roles", url: `${docs}/azure/role-based-access-control/custom-roles` },
  },
  {
    id: "sc500-t10",
    domainId: "identity",
    type: "single",
    prompt:
      "A subscription Owner asks why she cannot reset the authentication methods of a user in the directory, even though she owns every Azure resource in the tenant. What is the correct explanation?",
    options: [
      { id: "a", text: "Azure roles govern Azure resources, so she needs a Microsoft Entra role such as Authentication Administrator" },
      { id: "b", text: "Owner only applies to resources deployed after the role assignment was made to her" },
      { id: "c", text: "Owner permits directory changes, but only from the Azure CLI and never from a portal" },
      { id: "d", text: "She must be added to the classic Service Administrator role for the directory tenant" },
    ],
    correct: ["a"],
    explanation:
      "Azure roles control access to Azure resources, while Microsoft Entra roles control access to directory objects, and the two systems are separate. Resetting a user's authentication methods needs an Entra role such as Authentication Administrator, and classic administrator roles do not apply to the directory.",
    difficulty: 2,
    reference: { label: "Azure roles, Microsoft Entra roles, and classic subscription administrator roles", url: `${docs}/azure/role-based-access-control/rbac-and-directory-admin-roles` },
  },

  // ------------------------------------------------------- long scenarios
  {
    id: "sc500-t11",
    domainId: "identity",
    type: "multi",
    prompt:
      "Contoso's production subscription has fourteen engineers with permanent Owner. Requirements: (1) engineers must use approval and MFA whenever they need elevated rights; (2) production storage accounts must not be deleted by accident, even by an administrator; (3) storage accounts that have public network access enabled must be brought into compliance, including the ones that already exist. Which three actions should you take? (Choose three.)",
    options: [
      { id: "a", text: "Convert the permanent Owner assignments to eligible assignments in Privileged Identity Management with approval and MFA on activation" },
      { id: "b", text: "Apply a CanNotDelete lock to the production resource group so storage accounts cannot be deleted" },
      { id: "c", text: "Assign a policy with a Modify or DeployIfNotExists effect and run remediation tasks for the existing accounts" },
      { id: "d", text: "Replace Owner with a custom role whose NotActions list the delete operations for storage accounts" },
      { id: "e", text: "Create a deny assignment on the resource group that blocks all delete operations for every principal" },
      { id: "f", text: "Assign a policy with the Audit effect only, and ask account owners to fix the findings themselves" },
    ],
    correct: ["a", "b", "c"],
    explanation:
      "Eligible PIM assignments with approval and MFA satisfy requirement one. A CanNotDelete lock stops deletion by anyone who does not first remove the lock. Policy with Modify or DeployIfNotExists plus remediation tasks brings existing non-compliant accounts into compliance, whereas Audit only reports. Deny assignments cannot be created directly, and NotActions does not deny anything when other assignments grant the action.",
    difficulty: 3,
    reference: { label: "Lock your resources to protect your infrastructure", url: `${docs}/azure/azure-resource-manager/management/lock-resources` },
  },
  {
    id: "sc500-t12",
    domainId: "posture",
    type: "statements",
    scenario:
      "Fabrikam's SOC has tiers with different duties: Tier 1 analysts triage and assign incidents; Tier 2 analysts write and tune analytics rules; automation engineers build playbooks; a few colleagues only need to run existing playbooks on incidents; and auditors need read-only access. You are assigning Azure roles on the resource group that contains the Microsoft Sentinel workspace.",
    prompt: "For each assignment, select Yes if it meets the stated need with least privilege. Otherwise select No.",
    statements: [
      { id: "a", text: "Tier 1 analysts receive Microsoft Sentinel Responder to manage incidents.", correct: true },
      { id: "b", text: "Tier 2 analysts receive Microsoft Sentinel Reader to create and edit analytics rules.", correct: false },
      { id: "c", text: "Automation engineers receive Logic App Contributor, in addition to a Sentinel role, to create and edit playbooks.", correct: true },
      { id: "d", text: "Colleagues who only run existing playbooks receive Microsoft Sentinel Playbook Operator.", correct: true },
      { id: "e", text: "Auditors receive Microsoft Sentinel Contributor so that they can read all Sentinel data.", correct: false },
    ],
    correct: ["a", "c", "d"],
    explanation:
      "Responder adds incident management to Reader, Playbook Operator runs playbooks, and building playbooks needs Logic App Contributor because playbooks are Azure Logic Apps resources. Reader is read-only, so it cannot author rules, and auditors need only Reader rather than Contributor. Microsoft recommends assigning the roles at the resource group of the workspace.",
    difficulty: 3,
    reference: { label: "Roles and permissions in Microsoft Sentinel", url: `${docs}/azure/sentinel/roles` },
  },
  {
    id: "sc500-t13",
    domainId: "compute",
    type: "single",
    prompt:
      "Northwind lets five internal apps call one Microsoft Foundry model deployment. Requirements: (1) apps must authenticate to the model without keys; (2) each app must be capped on tokens per minute so that one cannot exhaust the quota; (3) requests must pass through a single managed entry point; (4) runtime attacks such as prompt injection must generate security alerts. Which solution meets all four?",
    options: [
      { id: "a", text: "Azure Front Door with response caching, a shared model key in each app, and a network security group on the model subnet" },
      { id: "b", text: "A public load balancer in front of the deployment, per-app API keys stored in Key Vault, and Azure Monitor metric alerts" },
      { id: "c", text: "Azure API Management as an AI gateway using managed identity to the model and token limit policies, plus AI threat protection in Defender for Cloud" },
      { id: "d", text: "Direct calls to the deployment from each app, a TPM limit on the deployment, and Microsoft Entra Conditional Access for the apps" },
    ],
    correct: ["c"],
    explanation:
      "API Management as an AI gateway is the single entry point, can authenticate to the model with a managed identity, and can enforce token limits per consumer. AI threat protection in Defender for Cloud raises alerts for threats to generative AI apps, including prompt evidence. The other designs use shared keys, cannot cap tokens per app, or do not generate AI security alerts.",
    difficulty: 3,
    reference: { label: "AI gateway capabilities in Azure API Management", url: `${docs}/azure/api-management/genai-gateway-capabilities` },
  },
  {
    id: "sc500-t14",
    domainId: "data-network",
    type: "single",
    prompt:
      "Tailwind runs a customer database on Azure SQL Database. Requirements: (1) all database activity must be audited to a destination that supports KQL analysis and to one that streams to a third-party SIEM; (2) the organisation must be able to revoke the encryption key at any moment; (3) the database must only accept connections that originate from the application virtual network; (4) anomalous access must raise security alerts. Which configuration meets all four?",
    options: [
      { id: "a", text: "Audit to a Log Analytics workspace and an event hub, TDE with a customer-managed key, a private endpoint with public access disabled, and Defender for Azure SQL" },
      { id: "b", text: "Audit to a storage account only, TDE with the service-managed key, a service endpoint with public access left on, and Defender for Storage" },
      { id: "c", text: "Audit to Azure Monitor metrics and the activity log, TDE with a customer-managed key, a private endpoint with public access left on, and Defender for Key Vault" },
      { id: "d", text: "Audit to a Log Analytics workspace and an event hub, TDE with the service-managed key, network security groups on the subnet only, and Defender for Cloud Apps" },
    ],
    correct: ["a"],
    explanation:
      "SQL auditing writes to storage, Log Analytics or Event Hubs, so Log Analytics plus an event hub covers KQL and SIEM streaming. A customer-managed TDE key lets the organisation revoke access, a private endpoint with public access disabled restricts connections to the virtual network, and Defender for Azure SQL raises anomalous access alerts. Each other option fails at least one requirement.",
    difficulty: 3,
    reference: { label: "Auditing for Azure SQL Database", url: `${docs}/azure/azure-sql/database/auditing-overview` },
  },
];
