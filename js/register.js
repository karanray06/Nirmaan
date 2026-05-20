import { supabase } from './supabase.js';

let currentStep = 1;

window.nextStep = (step) => {
  // Simple validation for previous step
  if(step === 2) {
    if(!document.getElementById('regName').checkValidity() || 
       !document.getElementById('regEmail').checkValidity() || 
       !document.getElementById('regPhone').checkValidity() || 
       !document.getElementById('regSchool').checkValidity() ||
       !document.getElementById('regGrade').checkValidity() ||
       !document.getElementById('regAge').checkValidity()) {
      alert("Please fill all fields in Step 1 correctly.");
      return;
    }
  } else if(step === 3) {
    if(!document.getElementById('regCom1').checkValidity() || 
       !document.getElementById('regPort1').checkValidity() || 
       !document.getElementById('regCom2').checkValidity() || 
       !document.getElementById('regPort2').checkValidity() ||
       !document.getElementById('regExp').checkValidity()) {
      alert("Please fill all fields in Step 2 correctly.");
      return;
    }
  }

  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step${step}`).classList.add('active');
  
  // Update indicators
  if(step >= 2) {
    document.getElementById('dot1').classList.replace('active', 'completed');
    document.getElementById('line1').classList.add('completed');
    document.getElementById('dot2').classList.add('active');
  }
  if(step === 3) {
    document.getElementById('dot2').classList.replace('active', 'completed');
    document.getElementById('line2').classList.add('completed');
    document.getElementById('dot3').classList.add('active');
  }
};

window.prevStep = (step) => {
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step${step}`).classList.add('active');
  
  // Update indicators
  if(step === 1) {
    document.getElementById('dot2').classList.remove('active');
    document.getElementById('line1').classList.remove('completed');
    document.getElementById('dot1').classList.replace('completed', 'active');
  }
  if(step === 2) {
    document.getElementById('dot3').classList.remove('active');
    document.getElementById('line2').classList.remove('completed');
    document.getElementById('dot2').classList.replace('completed', 'active');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('regForm');
  if(!form) return;

  const fileInput = document.getElementById('regFile');
  fileInput.addEventListener('change', (e) => {
    const fileName = e.target.files[0]?.name;
    if(fileName) {
      e.target.parentElement.querySelector('p').innerHTML = `Selected:<br><span style="color:var(--gold-accent)">${fileName}</span>`;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerText = "Submitting...";

    try {
      // 1. Collect Data
      const delegateId = 'NMN-2026-' + Math.floor(1000 + Math.random() * 9000);
      const file = fileInput.files[0];
      
      let proofUrl = '';
      if(file) {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${delegateId}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, file);
          
        if(uploadError) throw uploadError;
        proofUrl = uploadData.path;
      }

      const record = {
        delegate_id: delegateId,
        full_name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('regPhone').value,
        school: document.getElementById('regSchool').value,
        grade_year: document.getElementById('regGrade').value,
        age: document.getElementById('regAge').value,
        committee_1: document.getElementById('regCom1').value,
        portfolio_pref_1: document.getElementById('regPort1').value,
        committee_2: document.getElementById('regCom2').value,
        portfolio_pref_2: document.getElementById('regPort2').value,
        experience: document.getElementById('regExp').value,
        referral: document.getElementById('regReferral').value,
        anything_else: document.getElementById('regAnythingElse').value,
        payment_proof: proofUrl,
        payment_status: 'pending'
      };

      // 2. Insert to DB
      const { error: dbError } = await supabase
        .from('registrations')
        .insert([record]);

      if(dbError) throw dbError;

      // 3. Show Success
      form.style.display = 'none';
      document.querySelector('.steps-indicator').style.display = 'none';
      document.getElementById('displayDelegateId').innerText = delegateId;
      document.getElementById('successScreen').style.display = 'block';

    } catch (err) {
      console.error(err);
      alert("Error submitting registration. Please try again. " + (err.message || ''));
      btn.disabled = false;
      btn.innerText = "Submit Registration";
    }
  });
});
