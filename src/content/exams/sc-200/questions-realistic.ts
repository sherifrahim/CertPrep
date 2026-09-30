import type { Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

/**
 * Exam-style questions: KQL semantics where the obvious answer is wrong, and long
 * scenarios with several competing requirements. Every behaviour tested here is
 * documented on Microsoft Learn (Kusto query language reference and product docs).
 */
export const sc200RealisticQuestions: Question[] = [
  // ------------------------------------------------------------- KQL traps
  {
    id: "sc200-t1",
    domainId: "hunting",
    type: "single",
    prompt:
      "A Microsoft Sentinel analyst wants the five accounts with the most failed sign-ins in the last day and runs this query:\n\nSigninLogs\n| where TimeGenerated > ago(1d) and ResultType != '0'\n| summarize Failures = count() by UserPrincipalName\n| sort by Failures\n| take 5\n\nWhat does the query return?",
    options: [
      { id: "a", text: "The five accounts with the fewest failures, because sort by defaults to ascending order" },
      { id: "b", text: "The five accounts with the most failures, because sort by defaults to descending order" },
      { id: "c", text: "Five accounts in arbitrary order, because take ignores the sort that precedes it" },
      { id: "d", text: "A syntax error, because sort by requires an explicit asc or desc keyword" },
    ],
    correct: ["b"],
    explanation:
      "In KQL, sort by orders descending unless you say asc, and take simply keeps the first rows of whatever order it receives, so this returns the five highest failure counts. Contrast with SQL, where ORDER BY defaults to ascending.",
    difficulty: 2,
    reference: { label: "sort operator", url: `${docs}/kusto/query/sort-operator` },
  },
  {
    id: "sc200-t2",
    domainId: "hunting",
    type: "single",
    prompt:
      "You must show the ten most recent failed sign-ins for a single user in a Sentinel workbook. The data has thousands of matching rows. Which query is correct?",
    options: [
      { id: "a", text: "SigninLogs | where UserPrincipalName == 'a@contoso.com' and ResultType != '0' | take 10" },
      { id: "b", text: "SigninLogs | where UserPrincipalName == 'a@contoso.com' and ResultType != '0' | top 10 by TimeGenerated desc" },
      { id: "c", text: "SigninLogs | where UserPrincipalName == 'a@contoso.com' and ResultType != '0' | sort by TimeGenerated asc | take 10" },
      { id: "d", text: "SigninLogs | where UserPrincipalName == 'a@contoso.com' and ResultType != '0' | distinct TimeGenerated | take 10" },
    ],
    correct: ["b"],
    explanation:
      "take gives no guarantee about which rows come back, and can return different rows on each run, so it cannot answer 'most recent'. top 10 by TimeGenerated desc is equivalent to sorting descending and taking ten. Sorting ascending returns the oldest rows, and distinct returns only timestamps rather than the sign-in records.",
    difficulty: 2,
    reference: { label: "take operator", url: `${docs}/kusto/query/take-operator` },
  },
  {
    id: "sc200-t3",
    domainId: "hunting",
    type: "single",
    prompt:
      "An analyst joins three sign-in events from one IP address to a single threat intelligence row using the default join flavour:\n\nlet Signins = datatable(IP:string, User:string) ['1.2.3.4','alice', '1.2.3.4','bob', '1.2.3.4','carol'];\nlet Intel = datatable(IP:string, Reputation:string) ['1.2.3.4','malicious'];\nSignins\n| join Intel on IP\n| count\n\nWhat value does the query return?",
    options: [
      { id: "a", text: "0, because the two tables have no columns other than IP in common" },
      { id: "b", text: "1, because the default join deduplicates the left side on the join key" },
      { id: "c", text: "3, because every matching sign-in row is returned with its intel row" },
      { id: "d", text: "4, because each table row is emitted once for every match found" },
    ],
    correct: ["b"],
    explanation:
      "The default join flavour is innerunique, which deduplicates the left table on the join key before matching. The three sign-in rows collapse to one, so a single row joins to the single intel row. To keep all three sign-ins, specify kind=inner.",
    difficulty: 3,
    reference: { label: "join operator", url: `${docs}/kusto/query/join-operator` },
  },
  {
    id: "sc200-t4",
    domainId: "hunting",
    type: "single",
    prompt:
      "Hunters search Defender for Endpoint telemetry for credential dumping. An attacker ran this command line: mimikatz.exe sekurlsa::logonpasswords. Which of these filters on ProcessCommandLine would fail to match the event?",
    options: [
      { id: "a", text: "where ProcessCommandLine has 'mimikatz'" },
      { id: "b", text: "where ProcessCommandLine contains 'mimi'" },
      { id: "c", text: "where ProcessCommandLine has 'mimi'" },
      { id: "d", text: "where ProcessCommandLine has_any ('mimikatz', 'sekurlsa')" },
    ],
    correct: ["c"],
    explanation:
      "has matches whole terms, and the terms in this command line are mimikatz, exe, sekurlsa and logonpasswords, so 'mimi' is only part of a term and does not match. contains matches arbitrary substrings, and has or has_any with complete terms do match.",
    difficulty: 3,
    reference: { label: "has operator", url: `${docs}/kusto/query/has-operator` },
  },
  {
    id: "sc200-t5",
    domainId: "hunting",
    type: "single",
    prompt:
      "A hunting query filters DeviceLogonEvents with where AccountName == 'administrator', but it returns nothing even though the account Administrator logged on many times. Which change makes the filter match regardless of letter case?",
    options: [
      { id: "a", text: "where AccountName == tolower('Administrator')" },
      { id: "b", text: "where AccountName =~ 'administrator'" },
      { id: "c", text: "where AccountName has_cs 'administrator'" },
      { id: "d", text: "where AccountName startswith_cs 'administrator'" },
    ],
    correct: ["b"],
    explanation:
      "== is case-sensitive, so 'administrator' never equals 'Administrator'. =~ is the case-insensitive equality operator. Lower-casing only the right-hand side does not change the stored value, and the _cs operators are case-sensitive too.",
    difficulty: 2,
    reference: { label: "String operators", url: `${docs}/kusto/query/datatypes-string-operators` },
  },
  {
    id: "sc200-t6",
    domainId: "hunting",
    type: "single",
    prompt:
      "In the Microsoft Defender portal you are hunting in the DeviceProcessEvents table for processes started in the last 24 hours. Which query is correct?",
    options: [
      { id: "a", text: "DeviceProcessEvents | where TimeGenerated > ago(1d)" },
      { id: "b", text: "DeviceProcessEvents | where Timestamp > ago(1d)" },
      { id: "c", text: "DeviceProcessEvents | where EventTime > ago(1d)" },
      { id: "d", text: "DeviceProcessEvents | where Timestamp < ago(1d)" },
    ],
    correct: ["b"],
    explanation:
      "Microsoft Defender XDR advanced hunting tables such as DeviceProcessEvents use a Timestamp column, whereas Log Analytics and Sentinel tables such as SigninLogs use TimeGenerated. Using the wrong name is a common failure, and Timestamp < ago(1d) would select events older than a day.",
    difficulty: 2,
    reference: { label: "DeviceProcessEvents table", url: `${docs}/defender-xdr/advanced-hunting-deviceprocessevents-table` },
  },
  {
    id: "sc200-t7",
    domainId: "hunting",
    type: "single",
    prompt:
      "An audit report needs the exact number of distinct devices that ran a blocked script in the last week. Which query provides an exact answer?",
    options: [
      { id: "a", text: "DeviceEvents | where Timestamp > ago(7d) | summarize dcount(DeviceId)" },
      { id: "b", text: "DeviceEvents | where Timestamp > ago(7d) | summarize dcount(DeviceId, 4)" },
      { id: "c", text: "DeviceEvents | where Timestamp > ago(7d) | distinct DeviceId | count" },
      { id: "d", text: "DeviceEvents | where Timestamp > ago(7d) | summarize count() by DeviceId" },
    ],
    correct: ["c"],
    explanation:
      "dcount estimates cardinality and trades accuracy for performance, even at the highest accuracy setting, so it cannot guarantee an exact figure. distinct followed by count returns the exact number of unique values. Grouping by DeviceId returns a row per device instead of one number.",
    difficulty: 3,
    reference: { label: "dcount() aggregation function", url: `${docs}/kusto/query/dcount-aggregation-function` },
  },
  {
    id: "sc200-t8",
    domainId: "hunting",
    type: "single",
    prompt:
      "A SecurityAlert row has a dynamic column named Entities that holds an array of four entries, and several other scalar columns. What does the operator | mv-expand Entities do to that row?",
    options: [
      { id: "a", text: "Produces four rows, repeating the other columns' values on each of them" },
      { id: "b", text: "Produces one row, with the four entries joined into a single string" },
      { id: "c", text: "Produces four rows, keeping the other columns only on the first row" },
      { id: "d", text: "Produces one row, with the four entries spread across four new columns" },
    ],
    correct: ["a"],
    explanation:
      "mv-expand turns each element of a multi-value column into its own record, and all input columns that are not expanded are duplicated onto every output record. Use it, then project the parts you need, when hunting inside dynamic arrays.",
    difficulty: 2,
    reference: { label: "mv-expand operator", url: `${docs}/kusto/query/mv-expand-operator` },
  },
  {
    id: "sc200-t9",
    domainId: "hunting",
    type: "single",
    prompt:
      "You need every user with more than ten failed sign-ins in the last day. Which query works as intended?",
    options: [
      { id: "a", text: "SigninLogs | where ResultType != '0' | summarize Failures = count() by UserPrincipalName | where TimeGenerated > ago(1d) and Failures > 10" },
      { id: "b", text: "SigninLogs | where TimeGenerated > ago(1d) and ResultType != '0' | summarize Failures = count() by UserPrincipalName | where Failures > 10" },
      { id: "c", text: "SigninLogs | where TimeGenerated > ago(1d) and ResultType != '0' and count() > 10 | summarize by UserPrincipalName" },
      { id: "d", text: "SigninLogs | where TimeGenerated > ago(1d) | summarize Failures = count() by UserPrincipalName, ResultType | where Failures > 10" },
    ],
    correct: ["b"],
    explanation:
      "After summarize, only the grouping columns and the aggregates remain, so a later filter on TimeGenerated cannot work and the time filter belongs before summarize. Aggregates such as count() are not allowed inside where, and the last query counts successful sign-ins as well as failures.",
    difficulty: 3,
    reference: { label: "summarize operator", url: `${docs}/kusto/query/summarize-operator` },
  },
  {
    id: "sc200-t10",
    domainId: "hunting",
    type: "single",
    prompt:
      "Proxy logs in Sentinel store full URLs. You need every row whose Url contains the word evilcdn or the word phishkit anywhere in the address. Which filter is correct?",
    options: [
      { id: "a", text: "where Url in ('evilcdn', 'phishkit')" },
      { id: "b", text: "where Url in~ ('evilcdn', 'phishkit')" },
      { id: "c", text: "where Url has_any ('evilcdn', 'phishkit')" },
      { id: "d", text: "where Url == 'evilcdn' or 'phishkit'" },
    ],
    correct: ["c"],
    explanation:
      "in and in~ test whether the whole value equals one of the listed strings, so a full URL never matches. has_any matches when any of the terms appears in the value. The last form is not valid KQL, because == compares a single value.",
    difficulty: 2,
    reference: { label: "in operator", url: `${docs}/kusto/query/in-operator` },
  },

  // ------------------------------------------------------- long scenarios
  {
    id: "sc200-t11",
    domainId: "operations",
    type: "single",
    prompt:
      "Fabrikam uses Microsoft Sentinel in the Microsoft Defender portal, with Defender for Endpoint on all servers. The SOC defines these requirements: (1) when the analytics rule 'Suspicious PowerShell on server' creates an incident, the affected device must be isolated automatically; (2) no other analytics rule may cause isolation; (3) the automation must not depend on a stored user password or secret; (4) administrative effort should be kept to a minimum. What should you implement?",
    options: [
      { id: "a", text: "A playbook with an alert trigger attached to every analytics rule, running as a service account whose password is saved in the Logic App" },
      { id: "b", text: "An automation rule that runs on incident creation for that rule only, calling a playbook that isolates the device with a managed identity" },
      { id: "c", text: "A scheduled query that reads SecurityIncident every five minutes and calls the isolate action with an analyst's delegated credentials" },
      { id: "d", text: "A device group with the Full automation level, so that every incident raised for a server isolates the affected device automatically" },
    ],
    correct: ["b"],
    explanation:
      "An automation rule can be limited by a condition on the analytics rule name, which satisfies the scoping requirement, and it invokes a playbook without polling. Giving the playbook's managed identity the required Defender permissions avoids stored credentials. The other options apply to every rule, keep a secret, or misuse device group automation levels, which control remediation of investigated threats rather than isolation.",
    difficulty: 3,
    reference: { label: "Automate threat response with playbooks in Microsoft Sentinel", url: `${docs}/azure/sentinel/automate-responses-with-playbooks` },
  },
  {
    id: "sc200-t12",
    domainId: "operations",
    type: "single",
    prompt:
      "Litware has 200 workstations and 40 servers onboarded to Defender for Endpoint. Requirements: (1) servers must never have remediation actions run without an analyst approving them; (2) workstations should be remediated automatically; (3) Tier 1 analysts must see data for workstations only; (4) newly onboarded devices should fall into the right group automatically based on their names. Which design meets all four?",
    options: [
      { id: "a", text: "One tag-based device group set to Semi, with Tier 1 analysts granted Security Reader on the subscription" },
      { id: "b", text: "Two name-matched device groups, servers on Semi and workstations on Full, with Tier 1 access scoped to the workstation group" },
      { id: "c", text: "Two name-matched device groups both set to Full, using a deny assignment to stop remediation on servers" },
      { id: "d", text: "Two name-matched device groups both set to Full, ranking the server group below the workstation group" },
    ],
    correct: ["b"],
    explanation:
      "Each device group carries its own automation level and a matching rule based on name, domain, tags or OS. Semi requires approval, Full remediates automatically, and access to a group's data is granted to a Microsoft Entra user group scoped to it. A subscription role does not scope Defender for Endpoint data, a deny assignment cannot control remediation, and ranking only decides which group a device joins.",
    difficulty: 3,
    reference: { label: "Create and manage device groups", url: `${docs}/defender-endpoint/machine-groups` },
  },
];
