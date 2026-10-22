'use strict';
// No build step or external runtime is required for the page itself.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.06 });
  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${index % 3 * 60}ms`;
    observer.observe(element);
  });
} else {
  revealElements.forEach(element => element.classList.add('visible'));
}
reducedMotion.addEventListener('change', event => {
  if (event.matches) revealElements.forEach(element => element.classList.add('visible'));
});

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');
function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  menuButton.textContent = '☰';
}
menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  menuButton.textContent = open ? '✕' : '☰';
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => {
  if (!navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});
window.matchMedia('(min-width: 601px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const filters = document.querySelectorAll('[data-filter]');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(filter => {
    filter.classList.toggle('active', filter === button);
    filter.setAttribute('aria-pressed', String(filter === button));
  });
  document.querySelectorAll('.project-card').forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    if (!card.hidden) card.classList.add('visible');
  });
}));

// Case-study content comes from the resume supplied for this redesign.
const projects = {
  harvesteye: {
    label: '01 / AGRICULTURAL IoT & ANALYTICS',
    title: 'HarvestEye Portal',
    intro: 'Production AWS infrastructure for a platform that processes crop-harvesting data from field devices.',
    platform: 'An Angular frontend on CloudFront and S3, a Django backend on Lightsail and Apache, RDS MySQL, and a dedicated ETL server processing IoT device files from S3.',
    contribution: 'Designed and operated the infrastructure, provisioned selected resources with Terraform, built reporting and processing workloads, and automated application delivery and routine AWS operations.',
    highlights: [
      'Docker images in ECR power Lambda and ECS/Fargate workloads; EC2 supports AI/ML services.',
      'Bitbucket Pipelines handles deployments, health checks, and CloudFront cache invalidation.',
      'IAM SigV4 and API tokens support multi-tenant API access; IAM, security groups, KMS rotation, and WAF strengthen access controls.',
      'EventBridge, Lambda, and SES support scheduled processing and client reporting; CloudWatch centralizes logs and usage metrics.',
      'Python utilities automate S3, Parameter Store, RDS/MySQL, webhooks, and reporting in JSON, Excel, CSV, and Parquet.'
    ]
  },
  twellr: {
    label: '02 / AI APPLICATIONS · AWS & AZURE',
    title: 'Twellr.ai',
    intro: 'Cloud infrastructure and delivery workflows for AI-powered hair and skin analysis across three product lines.',
    platform: 'Application services on AWS EC2 and Elastic Beanstalk, dedicated GPU servers for Docker-based inference, PostgreSQL data storage, and shared D2C/B2B AI services.',
    contribution: 'Designed the AWS infrastructure, isolated development and UAT accounts, implemented per-service delivery pipelines, and deployed application stacks on Azure with secure service access and secrets management.',
    highlights: [
      'GitHub Actions builds Docker images, publishes versioned images to ECR, and deploys to EC2 using SSM Run Command.',
      'Candidate-container health checks and retained previous images provide a rollback path.',
      'Cognito OAuth2/OIDC, RS256 JWT/JWKS, SSM Parameter Store, Secrets Manager, and Key Vault support authentication and secrets management.',
      'CloudFront Origin Access Control restricts S3 media and model delivery.',
      'The D2C stack is deployed on Azure VMs with ACR, Key Vault, Docker, and GitHub Actions; DNS cutover is pending. B2B UAE UAT uses tenant subdomains, Azure PostgreSQL, and Blob Storage.'
    ]
  },
  supplier: {
    label: '03 / APPLICATION INFRASTRUCTURE & AUTOMATION',
    title: 'Supplier Portal',
    intro: 'A connected supplier application with secure AWS hosting, synchronized data, and automated file operations.',
    platform: 'An Angular frontend on CloudFront and S3, a Node.js/PM2 backend on EC2 behind an ALB, RDS MySQL, and a WordPress CRM accessed through the backend.',
    contribution: 'Designed the application infrastructure, built a VPN-based ETL workflow, automated S3 operations, and resolved operational issues affecting UAT stability and integrations.',
    highlights: [
      'Lambda event triggers automate S3 inter-bucket transfers and cleanup, reducing manual file-operations effort by 70%.',
      'A VPN-based ETL workflow extracts customer database records, synchronizes data, and generates PDF reports.',
      'Least-privilege IAM policies and restrictive security groups limit programmatic and network access.',
      'ALB, ACM, Route 53, and WAF provide TLS termination, custom-domain routing, and web-application protection.',
      'Resolved a PM2 restart loop causing backend disconnections and a CORS issue affecting the Angular and WordPress integration.'
    ]
  }
};
const dialog = document.getElementById('project-dialog');
let previousFocus;
function closeProject() {
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
  document.body.classList.remove('dialog-open');
  previousFocus?.focus({ preventScroll: true });
}
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projects[button.dataset.project];
  if (!project) return;
  previousFocus = button;
  for (const field of ['label', 'title', 'intro', 'platform', 'contribution']) {
    document.getElementById(`dialog-${field}`).textContent = project[field];
  }
  const highlights = document.getElementById('dialog-highlights');
  highlights.replaceChildren(...project.highlights.map(text => {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }));
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  document.body.classList.add('dialog-open');
  dialog.scrollTop = 0;
  dialog.querySelector('.dialog-close').focus({ preventScroll: true });
}));
document.querySelector('.dialog-close').addEventListener('click', closeProject);
dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeProject();
});
document.getElementById('dialog-contact').addEventListener('click', closeProject);

let toastTimer;
function toast(message) {
  const element = document.getElementById('toast');
  element.textContent = message;
  element.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('visible'), 3000);
}
document.getElementById('copy-email').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('gokulrech@gmail.com');
    toast('Email address copied');
  } catch {
    toast('Email me at gokulrech@gmail.com');
  }
});
document.getElementById('copyright-year').textContent = String(new Date().getFullYear());

// Preserve links from the previous portfolio.
if (location.hash === '#stack') document.getElementById('skills').scrollIntoView();
