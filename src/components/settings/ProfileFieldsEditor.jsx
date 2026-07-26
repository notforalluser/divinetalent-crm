import { Text } from "../ui/Typography";
import { Input } from "../ui/Input";
import TagInput from "../ui/TagInput";

const COMMON_ROLES = [
  "Data Engineer", "Data Scientist", "Data Analyst", "Full Stack Java Developer",
  "Full Stack Developer", "DevOps Engineer", "Business Analyst", "QA Engineer",
  "Project Manager", "React Developer", "Python Backend Engineer", "Cloud Engineer",
  "Machine Learning Engineer", "UI/UX Designer", "Salesforce Developer", "Network Engineer",
];
const COMMON_SKILLS = [
  "Python", "SQL", "AWS", "Azure", "React", "Java", "Spring Boot", ".NET", "Kubernetes",
  "Docker", "Spark", "Tableau", "Power BI", "Machine Learning", "Salesforce", "Excel",
];

function Field({ label, children }) {
  return (
    <div>
      <Text variant="micro" color="muted" className="uppercase tracking-wide mb-1 block">
        {label}
      </Text>
      {children}
    </div>
  );
}

/**
 * Fields shown here become what AI Match displays for a candidate --
 * regardless of what's actually in the uploaded resume. Any field left
 * blank is simply omitted from the AI Match result instead of showing an
 * empty placeholder.
 */
export default function ProfileFieldsEditor({ profile, onChange, idPrefix }) {
  function set(key, value) {
    onChange({ ...profile, [key]: value });
  }

  return (
    <div className="space-y-4">
      <Field label="Job role(s) -- matched against open jobs in AI Match">
        <TagInput
          value={profile.jobRoles}
          onChange={(v) => set("jobRoles", v)}
          placeholder="Type a role and press Enter (e.g. Data Analyst)"
          suggestions={COMMON_ROLES}
          listId={`${idPrefix}-roles`}
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name">
          <Input value={profile.name} onChange={(e) => set("name", e.target.value)} placeholder="Optional" />
        </Field>
        <Field label="Experience (years)">
          <Input
            type="number"
            min={0}
            max={50}
            value={profile.experienceYears}
            onChange={(e) => set("experienceYears", e.target.value)}
            placeholder="Optional"
          />
        </Field>
        <Field label="Mobile number">
          <Input value={profile.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="Optional" />
        </Field>
        <Field label="Email">
          <Input value={profile.email} onChange={(e) => set("email", e.target.value)} placeholder="Optional" />
        </Field>
        <Field label="Location">
          <Input value={profile.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Austin, Texas" />
        </Field>
      </div>

      <Field label="Skills">
        <TagInput
          value={profile.skills}
          onChange={(v) => set("skills", v)}
          placeholder="Type a skill and press Enter"
          suggestions={COMMON_SKILLS}
          listId={`${idPrefix}-skills`}
        />
      </Field>
    </div>
  );
}
