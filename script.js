class DigitalClock {
    constructor() {
        this.timezones = [
            'America/New_York',
            'Europe/London',
            'Asia/Tokyo',
            'Australia/Sydney'
        ];
        
        this.allTimezones = this.getAvailableTimezones();
        this.selectedTimezones = new Set(this.timezones);
        
        this.clockGrid = document.getElementById('clockGrid');
        this.addClockBtn = document.getElementById('addClockBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.modal = document.getElementById('timezoneModal');
        this.closeBtn = document.querySelector('.close');
        this.timezoneSearch = document.getElementById('timezoneSearch');
        this.timezoneList = document.getElementById('timezoneList');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderClocks();
        this.startClockUpdates();
    }

    setupEventListeners() {
        this.addClockBtn.addEventListener('click', () => this.openModal());
        this.resetBtn.addEventListener('click', () => this.resetClocks());
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        this.timezoneSearch.addEventListener('input', (e) => this.filterTimezones(e.target.value));
    }

    getAvailableTimezones() {
        // Common timezones organized by region
        return {
            'Americas': [
                'America/New_York',
                'America/Chicago',
                'America/Denver',
                'America/Los_Angeles',
                'America/Anchorage',
                'Pacific/Honolulu',
                'America/Toronto',
                'America/Mexico_City',
                'America/Sao_Paulo',
                'America/Buenos_Aires'
            ],
            'Europe': [
                'Europe/London',
                'Europe/Paris',
                'Europe/Berlin',
                'Europe/Madrid',
                'Europe/Rome',
                'Europe/Amsterdam',
                'Europe/Vienna',
                'Europe/Prague',
                'Europe/Moscow',
                'Europe/Istanbul'
            ],
            'Asia': [
                'Asia/Dubai',
                'Asia/Kolkata',
                'Asia/Bangkok',
                'Asia/Singapore',
                'Asia/Hong_Kong',
                'Asia/Shanghai',
                'Asia/Tokyo',
                'Asia/Seoul',
                'Asia/Manila',
                'Asia/Jakarta'
            ],
            'Pacific': [
                'Australia/Sydney',
                'Australia/Melbourne',
                'Australia/Brisbane',
                'Australia/Perth',
                'Pacific/Auckland',
                'Pacific/Fiji',
                'Pacific/Tongatapu'
            ],
            'Africa': [
                'Africa/Cairo',
                'Africa/Johannesburg',
                'Africa/Lagos',
                'Africa/Nairobi',
                'Africa/Morocco'
            ]
        };
    }

    renderClocks() {
        this.clockGrid.innerHTML = '';
        
        if (this.selectedTimezones.size === 0) {
            this.clockGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: white;">
                    <p style="font-size: 1.2rem;">No timezones selected. Click "Add Timezone" to get started!</p>
                </div>
            `;
            return;
        }

        this.selectedTimezones.forEach(timezone => {
            const card = this.createClockCard(timezone);
            this.clockGrid.appendChild(card);
        });
    }

    createClockCard(timezone) {
        const card = document.createElement('div');
        card.className = 'clock-card';
        card.id = `clock-${timezone}`;
        
        const [region, city] = timezone.split('/');
        
        card.innerHTML = `
            <button class="remove-btn" data-timezone="${timezone}">&times;</button>
            <div class="timezone-name">${city.replace(/_/g, ' ')}</div>
            <div class="timezone-region">${region}</div>
            <div class="digital-time" data-timezone="${timezone}">--:--:--</div>
            <div class="time-period" data-period="${timezone}">AM</div>
            <div class="date-info" data-date="${timezone}">--/--/----</div>
        `;

        card.querySelector('.remove-btn').addEventListener('click', (e) => {
            const tz = e.target.dataset.timezone;
            this.selectedTimezones.delete(tz);
            this.renderClocks();
        });

        return card;
    }

    updateClocks() {
        this.selectedTimezones.forEach(timezone => {
            const time = this.getTimeInTimezone(timezone);
            const timeDisplay = document.querySelector(`[data-timezone="${timezone}"]`);
            const periodDisplay = document.querySelector(`[data-period="${timezone}"]`);
            const dateDisplay = document.querySelector(`[data-date="${timezone}"]`);

            if (timeDisplay) {
                timeDisplay.textContent = time.timeString;
                periodDisplay.textContent = time.period;
                dateDisplay.textContent = time.dateString;
            }
        });
    }

    getTimeInTimezone(timezone) {
        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });

            const dateFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
            });

            const timeParts = formatter.formatToParts(new Date());
            const dateParts = dateFormatter.formatToParts(new Date());

            const hour = timeParts.find(p => p.type === 'hour').value;
            const minute = timeParts.find(p => p.type === 'minute').value;
            const second = timeParts.find(p => p.type === 'second').value;
            const period = hour < 12 ? 'AM' : 'PM';

            const month = dateParts.find(p => p.type === 'month').value;
            const day = dateParts.find(p => p.type === 'day').value;
            const year = dateParts.find(p => p.type === 'year').value;

            return {
                timeString: `${hour}:${minute}:${second}`,
                period: period,
                dateString: `${month}/${day}/${year}`
            };
        } catch (error) {
            console.error(`Error getting time for timezone: ${timezone}`, error);
            return {
                timeString: '00:00:00',
                period: 'AM',
                dateString: '00/00/0000'
            };
        }
    }

    openModal() {
        this.modal.classList.remove('hidden');
        this.renderTimezoneList(this.allTimezones);
    }

    closeModal() {
        this.modal.classList.add('hidden');
        this.timezoneSearch.value = '';
    }

    renderTimezoneList(timezones) {
        this.timezoneList.innerHTML = '';
        
        Object.entries(timezones).forEach(([region, tzList]) => {
            const regionDiv = document.createElement('div');
            regionDiv.style.marginBottom = '1rem';
            
            const regionTitle = document.createElement('div');
            regionTitle.style.fontWeight = 'bold';
            regionTitle.style.marginBottom = '0.5rem';
            regionTitle.style.color = '#667eea';
            regionTitle.textContent = region;
            regionDiv.appendChild(regionTitle);
            
            tzList.forEach(tz => {
                const option = document.createElement('div');
                option.className = 'timezone-option';
                if (this.selectedTimezones.has(tz)) {
                    option.classList.add('selected');
                }
                
                const [region, city] = tz.split('/');
                option.textContent = `${city.replace(/_/g, ' ')} (${region})`;
                option.dataset.timezone = tz;
                
                option.addEventListener('click', () => this.toggleTimezone(tz));
                regionDiv.appendChild(option);
            });
            
            this.timezoneList.appendChild(regionDiv);
        });
    }

    toggleTimezone(timezone) {
        if (this.selectedTimezones.has(timezone)) {
            this.selectedTimezones.delete(timezone);
        } else {
            this.selectedTimezones.add(timezone);
        }
        this.renderClocks();
        this.renderTimezoneList(this.allTimezones);
    }

    filterTimezones(searchTerm) {
        const filtered = {};
        const term = searchTerm.toLowerCase();

        Object.entries(this.allTimezones).forEach(([region, tzList]) => {
            const filteredTz = tzList.filter(tz => {
                const city = tz.split('/')[1].toLowerCase();
                const regionLower = region.toLowerCase();
                return city.includes(term) || regionLower.includes(term);
            });

            if (filteredTz.length > 0) {
                filtered[region] = filteredTz;
            }
        });

        this.renderTimezoneList(filtered);
    }

    resetClocks() {
        this.selectedTimezones.clear();
        this.timezones.forEach(tz => this.selectedTimezones.add(tz));
        this.renderClocks();
    }

    startClockUpdates() {
        this.updateClocks();
        setInterval(() => this.updateClocks(), 1000);
    }
}

// Initialize the clock when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DigitalClock();
});