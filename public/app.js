document.addEventListener('alpine:init', () => {
  Alpine.data('app', () => ({

    // ── State ──────────────────────────────────────────────────────────────
    sources: [],
    filterCategory: '',
    filterTier: '',
    searchQuery: '',
    showUpToDate: false,
    showSnoozed: false,

    // Modals
    checkinModal:     false,
    addSourceModal:   false,
    editSourceModal:  false,
    historyModal:     false,
    snoozeModal:      false,

    selectedSource:   null,
    checkinNotes:     '',
    historyEntries:   [],
    snoozeDays:       7,

    newSource: { name: '', url: '', category: 'General Job Board', tier: 1, check_frequency_days: 7 },
    editSource: null,

    categories: [
      'General Job Board',
      'Sector Job Board',
      'Professional Community',
      'Research/Consulting Firm',
      'Foundation',
      'Edtech Company',
      'Nonprofit/Social Sector',
      'AI in Education',
      'PNW/Oregon Specific',
    ],

    // ── Init ───────────────────────────────────────────────────────────────
    async init() {
      await this.loadSources();
    },

    async loadSources() {
      const res = await fetch('/api/sources');
      this.sources = await res.json();
    },

    // ── Date helpers ───────────────────────────────────────────────────────
    today() {
      return new Date().toISOString().split('T')[0];
    },

    isSnoozed(source) {
      return source.snooze_until && source.snooze_until >= this.today();
    },

    // Returns days overdue (positive = overdue, negative = still good, null = never checked)
    daysOverdue(source) {
      if (!source.last_checked) return null;
      const due = new Date(source.last_checked + 'T00:00:00');
      due.setDate(due.getDate() + source.check_frequency_days);
      const now = new Date(this.today() + 'T00:00:00');
      return Math.floor((now - due) / 86400000);
    },

    nextDue(source) {
      if (!source.last_checked) return null;
      const d = new Date(source.last_checked + 'T00:00:00');
      d.setDate(d.getDate() + source.check_frequency_days);
      return d.toISOString().split('T')[0];
    },

    formatDate(dateStr) {
      if (!dateStr) return 'Never';
      return new Date(dateStr + 'T00:00:00')
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },

    // ── Card display ───────────────────────────────────────────────────────
    urgencyClass(source) {
      if (!source.last_checked) return 'border-purple';
      if (this.isSnoozed(source)) return 'border-gray';
      const d = this.daysOverdue(source);
      if (d >= 7)  return 'border-red';
      if (d >= 1)  return 'border-yellow';
      return 'border-green';
    },

    overdueLabel(source) {
      const d = this.daysOverdue(source);
      if (d === null || d <= 0) return null;
      return d === 1 ? '1 day overdue' : `${d} days overdue`;
    },

    overdueTagClass(source) {
      const d = this.daysOverdue(source);
      if (d === null || d <= 0) return '';
      return d >= 7 ? 'tag-red' : 'tag-yellow';
    },

    // ── Grouped views ──────────────────────────────────────────────────────
    get filtered() {
      const q = this.searchQuery.toLowerCase();
      return this.sources.filter(s => {
        if (!s.active) return false;
        if (this.filterCategory && s.category !== this.filterCategory) return false;
        if (this.filterTier && s.tier != this.filterTier) return false;
        if (q) return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
        return true;
      });
    },

    get needsAttention() {
      return this.filtered
        .filter(s => s.last_checked && !this.isSnoozed(s) && this.daysOverdue(s) > 0)
        .sort((a, b) => this.daysOverdue(b) - this.daysOverdue(a));
    },

    get neverChecked() {
      return this.filtered.filter(s => !s.last_checked && !this.isSnoozed(s));
    },

    get upToDate() {
      return this.filtered
        .filter(s => s.last_checked && !this.isSnoozed(s) && this.daysOverdue(s) <= 0)
        .sort((a, b) => a.name.localeCompare(b.name));
    },

    get snoozedSources() {
      return this.filtered.filter(s => this.isSnoozed(s));
    },

    get stats() {
      const active = this.sources.filter(s => s.active);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      return {
        total:           active.length,
        overdue:         active.filter(s => s.last_checked && !this.isSnoozed(s) && this.daysOverdue(s) > 0).length,
        neverChecked:    active.filter(s => !s.last_checked).length,
        checkedThisWeek: active.filter(s => s.last_checked && s.last_checked >= weekAgoStr).length,
      };
    },

    // ── Actions ────────────────────────────────────────────────────────────
    checkNow(source) {
      window.open(source.url, '_blank');
      this.selectedSource = source;
      this.checkinNotes = '';
      this.checkinModal = true;
    },

    async saveCheckin() {
      await fetch(`/api/sources/${this.selectedSource.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: this.checkinNotes }),
      });
      await this.loadSources();
      this.checkinModal = false;
    },

    openAddSource() {
      this.newSource = { name: '', url: '', category: '', tier: '', check_frequency_days: 14 };
      this.addSourceModal = true;
    },

    async saveNewSource() {
      if (!this.newSource.name.trim() || !this.newSource.url.trim()) return;
      await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.newSource),
      });
      await this.loadSources();
      this.addSourceModal = false;
    },

    openEditSource(source) {
      this.editSource = { ...source };
      this.editSourceModal = true;
    },

    async saveEditSource() {
      await fetch(`/api/sources/${this.editSource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.editSource),
      });
      await this.loadSources();
      this.editSourceModal = false;
    },

    async deleteSource(source) {
      if (!confirm(`Delete "${source.name}"? This cannot be undone.`)) return;
      await fetch(`/api/sources/${source.id}`, { method: 'DELETE' });
      await this.loadSources();
      this.editSourceModal = false;
    },

    async viewHistory(source) {
      this.selectedSource = source;
      const res = await fetch(`/api/sources/${source.id}/history`);
      this.historyEntries = await res.json();
      this.historyModal = true;
    },

    openSnooze(source) {
      this.selectedSource = source;
      this.snoozeDays = 7;
      this.snoozeModal = true;
    },

    async saveSnooze() {
      await fetch(`/api/sources/${this.selectedSource.id}/snooze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: this.snoozeDays }),
      });
      await this.loadSources();
      this.snoozeModal = false;
    },

    exportCSV() {
      window.location.href = '/api/export/csv';
    },

    // Pressing Escape closes the topmost open modal
    handleEsc() {
      if (this.historyModal)    { this.historyModal    = false; return; }
      if (this.checkinModal)    { this.checkinModal    = false; return; }
      if (this.snoozeModal)     { this.snoozeModal     = false; return; }
      if (this.editSourceModal) { this.editSourceModal = false; return; }
      if (this.addSourceModal)  { this.addSourceModal  = false; return; }
    },

  }));
});
