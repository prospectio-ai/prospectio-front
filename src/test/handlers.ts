import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8000/prospectio/rest/v1';

export const profileData = {
  job_title: 'Senior Full Stack Developer',
  location: 'FR, Paris',
  bio: 'Experienced developer with 10 years of expertise.',
  work_experience: [
    {
      company: 'Acme Corp',
      position: 'Lead Developer',
      start_date: '2020-01',
      end_date: '',
      description: 'Leading the frontend team.',
    },
  ],
  technos: ['React', 'TypeScript', 'Python'],
};

export const handlers = [
  // Config
  http.get('/config.json', () => {
    return HttpResponse.json({
      chatbotUrl: 'http://localhost:3000',
      backendUrl: 'http://localhost:8000',
      logtoUrl: 'http://localhost:3002',
      logtoAppId: 'test-app-id',
      redirectUrl: 'http://localhost:5173/callback',
      signOutUrl: 'http://localhost:5173',
    });
  }),

  // Profile
  http.get(`${BASE_URL}/profile`, () => {
    return HttpResponse.json(profileData);
  }),

  http.post(`${BASE_URL}/profile/upsert`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),

  // Leads
  http.get(`${BASE_URL}/leads/jobs/:offset/:limit`, () => {
    return HttpResponse.json({
      jobs: [
        {
          id: '1',
          title: 'Frontend Developer',
          company: 'TechCo',
          location: 'Paris',
        },
      ],
    });
  }),

  http.get(`${BASE_URL}/leads/companies/:offset/:limit`, () => {
    return HttpResponse.json({
      companies: [
        {
          id: '1',
          name: 'TechCo',
          industry: 'Technology',
        },
      ],
    });
  }),

  http.get(`${BASE_URL}/leads/contacts/:offset/:limit`, () => {
    return HttpResponse.json({
      contacts: [
        {
          id: '1',
          name: 'John Doe',
          company: 'TechCo',
        },
      ],
    });
  }),
];
