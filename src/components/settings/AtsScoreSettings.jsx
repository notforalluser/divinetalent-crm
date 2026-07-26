import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import { Heading, Text } from "../ui/Typography";
import { Input } from "../ui/Input";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";
import { useSettings } from "../../context/SettingsContext";
import ProfileFieldsEditor from "./ProfileFieldsEditor";

function Row({ title, sub, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-line last:border-0">
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        {sub && (
          <Text variant="small" color="muted" className="mt-0.5">
            {sub}
          </Text>
        )}
      </div>
      {children}
    </div>
  );
}

const EMPTY_DRAFT = { filename: "", minScore: 80, profile: { jobRoles: [], experienceYears: "", location: "", name: "", mobile: "", email: "", skills: [] } };

export default function AtsScoreSettings() {
  const { settings, updateSetting, updateGeneralProfile, upsertAtsOverride, removeAtsOverride } = useSettings();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  function handleMinChange(v) {
    const min = Math.max(0, Math.min(100, Number(v)));
    updateSetting("atsScoreMin", min);
    if (settings.atsScoreMax <= min) updateSetting("atsScoreMax", Math.min(100, min + 1));
  }

  function handleMaxChange(v) {
    const max = Math.max(0, Math.min(100, Number(v)));
    if (max <= settings.atsScoreMin) return; // max must stay strictly greater than min
    updateSetting("atsScoreMax", max);
  }

  function openCreate() {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setModalOpen(true);
  }

  function openEdit(override) {
    setEditingId(override.id);
    setDraft({ filename: override.filename, minScore: override.minScore, profile: { ...override.profile } });
    setModalOpen(true);
  }

  function saveDraft() {
    if (!draft.filename.trim()) return;
    upsertAtsOverride(editingId, draft);
    setModalOpen(false);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <Heading variant="h4">ATS score simulation -- all users</Heading>
        </CardHeader>
        <CardBody className="!py-0">
          <Row title="Score range (general resumes)" sub="Any resume without a filename override lands somewhere in this range">
            <div className="flex items-center gap-2">
              <Input type="number" min={0} max={100} value={settings.atsScoreMin} onChange={(e) => handleMinChange(e.target.value)} className="w-20" />
              <span className="text-slate text-sm">to</span>
              <Input type="number" min={0} max={100} value={settings.atsScoreMax} onChange={(e) => handleMaxChange(e.target.value)} className="w-20" />
            </div>
          </Row>
          <Row title="Eligibility threshold" sub="Scores at or above this are 'Eligible'; below are 'Not Eligible'">
            <Input
              type="number"
              min={0}
              max={100}
              value={settings.atsEligibilityThreshold}
              onChange={(e) => updateSetting("atsEligibilityThreshold", Math.max(0, Math.min(100, Number(e.target.value))))}
              className="w-24"
            />
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Heading variant="h4">Displayed profile -- all users</Heading>
        </CardHeader>
        <CardBody>
          <Text variant="small" color="muted" className="mb-4">
            AI Match shows these details for any resume without a filename override below -- not whatever is
            actually written in the uploaded file. Leave a field blank to simply omit it from the result.
          </Text>
          <ProfileFieldsEditor profile={settings.atsGeneralProfile} onChange={updateGeneralProfile} idPrefix="general" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <Heading variant="h4">ATS score overrides -- specific filenames</Heading>
            <Text variant="small" color="muted" className="mt-0.5">
              Each filename gets its own minimum score and its own full display profile.
            </Text>
          </div>
          <Button variant="dark" size="sm" icon={Plus} onClick={openCreate}>
            Add filename
          </Button>
        </CardHeader>
        <CardBody className="!pt-0">
          {settings.atsFilenameOverrides.length === 0 ? (
            <Text variant="small" color="muted" className="py-4 block">
              No filename overrides yet.
            </Text>
          ) : (
            <div className="divide-y divide-line rounded-lg border border-line">
              {settings.atsFilenameOverrides.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{o.filename}</p>
                    {o.profile.jobRoles.length > 0 && (
                      <p className="text-xs text-slate truncate">{o.profile.jobRoles.join(", ")}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge tone="Active">≥ {o.minScore}</Badge>
                    <button onClick={() => openEdit(o)} className="text-slate hover:text-ink">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => removeAtsOverride(o.id)} className="text-slate hover:text-crimson-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit filename override" : "Add filename override"}
        subtitle="Any resume uploaded with this exact filename gets this score and this display profile."
        wide
      >
        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Text variant="micro" color="muted" className="uppercase tracking-wide mb-1 block">
                Filename
              </Text>
              <Input
                value={draft.filename}
                onChange={(e) => setDraft({ ...draft, filename: e.target.value })}
                placeholder="ramesh_resume.pdf"
              />
            </div>
            <div>
              <Text variant="micro" color="muted" className="uppercase tracking-wide mb-1 block">
                Minimum score (random up to 100)
              </Text>
              <Input
                type="number"
                min={0}
                max={100}
                value={draft.minScore}
                onChange={(e) => setDraft({ ...draft, minScore: e.target.value })}
              />
            </div>
          </div>

          <ProfileFieldsEditor
            profile={draft.profile}
            onChange={(profile) => setDraft({ ...draft, profile })}
            idPrefix={editingId || "new"}
          />
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-line">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="dark" onClick={saveDraft} disabled={!draft.filename.trim()}>
            Save
          </Button>
        </div>
      </Modal>
    </>
  );
}
