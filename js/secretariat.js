import { supabase } from './supabase.js';

let currentStep = 1;

window.nextSecStep = (step) => {
  if(step === 2) {
    if(!document.getElementById('secName').checkValidity() || 
       !document.getElementById('secEmail').checkValidity() || 
       !document.getElementById('secPhone').checkValidity() || 
       !document.getElementById('secSchool').checkValidity() ||
       !document.getElementById('secGrade').checkValidity() ||
       !document.getElementById('secAge').checkValidity() ||
       !document.getElementById('secCityState').checkValidity()) {
      alert("Please fill all required fields in Step 1 correctly.");
      return;
    }
  } else if(step === 3) {
    const sectors = Array.from(document.querySelectorAll('input[name="sectors"]:checked')).map(el => el.value);
    if(sectors.length === 0) {
      alert("Please select at least one sector preference.");
      return;
    }
    if(!document.getElementById('secMunExp').checkValidity() || 
       !document.getElementById('secPriorExp').checkValidity()) {
      alert("Please fill all required fields in Step 2 correctly.");
      return;
    }
  }

  document.querySelectorAll('#secretariatFormWizard .form-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`secStep${step}`).classList.add('active');
  
  // Update indicators
  if(step >= 2) {
    document.getElementById('secDot1').classList.replace('active', 'completed');
    document.getElementById('secLine1').classList.add('completed');
    document.getElementById('secDot2').classList.add('active');
  }
  if(step === 3) {
    document.getElementById('secDot2').classList.replace('active', 'completed');
    document.getElementById('secLine2').classList.add('completed');
    document.getElementById('secDot3').classList.add('active');
  }
};

window.prevSecStep = (step) => {
  document.querySelectorAll('#secretariatFormWizard .form-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`secStep${step}`).classList.add('active');
  
  // Update indicators
  if(step === 1) {
    document.getElementById('secDot2').classList.remove('active');
    document.getElementById('secLine1').classList.remove('completed');
    document.getElementById('secDot1').classList.replace('completed', 'active');
  }
  if(step === 2) {
    document.getElementById('secDot3').classList.remove('active');
    document.getElementById('secLine2').classList.remove('completed');
    document.getElementById('secDot2').classList.replace('completed', 'active');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('secForm');
  if(!form) return;

  const fileInput = document.getElementById('secFile');
  fileInput.addEventListener('change', (e) => {
    const fileName = e.target.files[0]?.name;
    if(fileName) {
      e.target.parentElement.querySelector('p').innerHTML = `Selected:<br><span style="color:var(--gold-accent)">${fileName}</span>`;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('secSubmitBtn');
    btn.disabled = true;
    btn.innerText = "Submitting...";

    try {
      // 1. Collect Data
      const appId = 'NMN-SEC-2026-' + Math.floor(1000 + Math.random() * 9000);
      const file = fileInput.files[0];
      
      let cvUrl = '';
      if(file) {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${appId}-${Date.now()}.${fileExt}`;
        
        try {
          let { data: uploadData, error: uploadError } = await supabase.storage
            .from('secretariat-cvs')
            .upload(fileName, file);
            
          if (uploadError) throw uploadError;
          
          // Store the path so the admin can generate a signed url or download it.
          // Since it's not a public bucket, getPublicUrl won't work for anonymous users viewing it.
          // We will store the path.
          cvUrl = uploadData.path;
        } catch (storageErr) {
          console.warn('Storage upload failed, saving without CV:', storageErr.message);
          cvUrl = '';
        }
      }

      const sectors = Array.from(document.querySelectorAll('input[name="sectors"]:checked')).map(el => el.value);

      const record = {
        application_id: appId,
        full_name: document.getElementById('secName').value,
        email: document.getElementById('secEmail').value,
        phone: document.getElementById('secPhone').value,
        institution: document.getElementById('secSchool').value,
        grade_year: document.getElementById('secGrade').value,
        age: document.getElementById('secAge').value,
        city_state: document.getElementById('secCityState').value,
        instagram_handle: document.getElementById('secInsta').value,
        
        sectors: sectors,
        mun_experience_rating: parseInt(document.getElementById('secMunExp').value, 10),
        mun_cv_url: cvUrl,
        prior_secretariat_experience: document.getElementById('secPriorExp').value,
        portfolio_links: document.getElementById('secPortfolio').value,
        
        why_suitable: document.getElementById('secWhySuitable').value,
        unique_idea: document.getElementById('secUniqueIdea').value,
        why_passionate: document.getElementById('secWhyPassionate').value,
        reference: document.getElementById('secReference').value,
        anything_else: document.getElementById('secAnythingElse').value,
        declaration_agreed: document.getElementById('secDeclaration').checked,
        
        status: 'pending'
      };

      // 2. Insert to DB
      const { error: dbError } = await supabase
        .from('secretariat_applications')
        .insert([record]);

      if(dbError) throw dbError;

      // 3. Show Success
      form.style.display = 'none';
      document.querySelector('#secretariatFormWizard .steps-indicator').style.display = 'none';
      document.getElementById('displaySecAppId').innerText = appId;
      document.getElementById('secSuccessScreen').style.display = 'block';

    } catch (err) {
      console.error(err);
      alert("Error submitting application. Please try again. " + (err.message || ''));
      btn.disabled = false;
      btn.innerText = "Submit Application";
    }
  });
});
