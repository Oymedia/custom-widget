document.addEventListener("DOMContentLoaded", function () {
  const jobList = document.getElementById("job-list");
  const searchInput = document.getElementById("job-search");
  const departmentFilter = document.getElementById("department-filter");
  const locationFilter = document.getElementById("location-filter");
  const searchBtn = document.getElementById("search-btn");
  const searchRestBtn = document.getElementById("rest-btn");

  const greenhouseConfig = {
    boardToken: "bayasystems",
    apiUrl: "https://boards-api.greenhouse.io/v1/boards/",
  };

  let allJobsData = [];
  let departmentsData = [];
  let officesData = [];

  function getDepartmentByJobId(departments, jobId) {
    return departments.find((dept) =>
      dept.jobs?.some((job) => job.id === jobId)
    );
  }

  async function fetchSearch() {
    try {
      const departmentsResponse = await fetch(
        `${greenhouseConfig.apiUrl}${greenhouseConfig.boardToken}/departments`
      );

      const officesResponse = await fetch(
        `${greenhouseConfig.apiUrl}${greenhouseConfig.boardToken}/offices`
      );

      const departments = await departmentsResponse.json();
      departmentsData = departments.departments || [];

      const offices = await officesResponse.json();
      officesData = offices.offices || [];

      renderDepartments(departmentsData);
      renderOffices(officesData);
    } catch (error) {
      console.error("Error fetching filter:", error);
    }
  }

  async function fetchJobs() {
    jobList.innerHTML = '<div class="loading">Loading jobs...</div>';

    try {
      const response = await fetch(
        `${greenhouseConfig.apiUrl}${greenhouseConfig.boardToken}/jobs`
      );

      const data = await response.json();
      allJobsData = data.jobs || [];

      applyFilters();
    } catch (error) {
      console.error("Error fetching jobs:", error);
      jobList.innerHTML =
        '<div class="error">Error loading jobs. Please try again later.</div>';
    }
  }

  function applyFilters() {
    const searchKeyword = searchInput.value.toLowerCase().trim();
    const selectedDepartmentId = parseInt(departmentFilter.value) || "all";
    const selectedLocationId = parseInt(locationFilter.value) || "all";

    let filteredJobs = [...allJobsData];

    if (searchKeyword) {
      filteredJobs = filteredJobs.filter((job) =>
        job.title.toLowerCase().includes(searchKeyword)
      );
    }

    if (selectedDepartmentId !== "all") {
      filteredJobs = filteredJobs.filter((job) => {
        const department = getDepartmentByJobId(departmentsData, job.id);
        return department && department.id === selectedDepartmentId;
      });
    }

    if (selectedLocationId !== "all") {
      const selectedOffice = officesData.find(
        (office) => office.id === selectedLocationId
      );
      if (selectedOffice) {
        const officeJobIds =
          selectedOffice.departments?.flatMap(
            (dept) => dept.jobs?.map((job) => job.id) || []
          ) || [];

        filteredJobs = filteredJobs.filter((job) =>
          officeJobIds.includes(job.id)
        );
      }
    }

    renderJobs(filteredJobs);
  }

  function renderJobs(jobs) {
    if (!jobs || jobs.length === 0) {
      jobList.innerHTML =
        '<div class="loading">No jobs found matching your criteria.</div>';
      return;
    }

    jobList.innerHTML = "";

    jobs.forEach((job, index) => {
      const jobLocation = job.location ? job.location.name : "Remote";
      const department = getDepartmentByJobId(departmentsData, job?.id);
      const departmentName = department ? department.name : "General";

      const jobElement = document.createElement("div");
      jobElement.className = "job-card";
      jobElement.innerHTML = `
      <div class="job-info" data-job-id="${job.id}">
        <div class="job-location">${jobLocation}</div>
        <h2 class="job-title">${job.title}</h2>
        <div class="job-department">${departmentName}</div>
      </div>
      <button class="learn-more-btn" data-job-id="${job.id}">
        Learn More
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="currentColor"
        >
          <path
            d="M5.63589 19.7784L4.22169 18.3644L15.657 6.92908L10.0712 6.92908V4.92908L19.0712 4.92908L19.0712 13.9291H17.0712L17.0712 8.34326L5.63589 19.7784Z"
          ></path>
        </svg>
      </button>`;

      jobList.appendChild(jobElement);

      if (index < jobs.length - 1) {
        const divider = document.createElement("div");
        divider.className = "divider";
        jobList.appendChild(divider);
      }
    });

    document.querySelectorAll(".learn-more-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const jobId = e.currentTarget.getAttribute("data-job-id");
        window.open(
          `https://job-boards.greenhouse.io/bayasystems/jobs/${jobId}`,
          "_blank"
        );
      });
    });

    document.querySelectorAll(".job-info").forEach((info) => {
      info.addEventListener("click", (e) => {
        const jobId = e.currentTarget.getAttribute("data-job-id");
        window.open(
          `https://job-boards.greenhouse.io/bayasystems/jobs/${jobId}`,
          "_blank"
        );
      });
    });
  }

  function renderDepartments(departments) {
    const departmentEle = document.getElementById("department-filter");

    departmentEle.innerHTML = '<option value="all">All Departments</option>';

    departments?.forEach((dep) => {
      const individualOption = document.createElement("option");
      individualOption.setAttribute("value", dep.id);
      individualOption.textContent = dep.name;
      departmentEle.appendChild(individualOption);
    });
  }

  function renderOffices(offices) {
    const officeEle = document.getElementById("location-filter");

    officeEle.innerHTML = '<option value="all">All Locations</option>';

    offices?.forEach((office) => {
      const individualOption = document.createElement("option");
      individualOption.setAttribute("value", office.id);
      individualOption.textContent = office.name;
      officeEle.appendChild(individualOption);
    });
  }

  searchBtn.addEventListener("click", () => {
    applyFilters();
    if (searchInput.value.trim() !== "") {
      searchRestBtn.style.display = "block";
    }
  });

  searchRestBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchRestBtn.style.display = "none";
    applyFilters();
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      applyFilters();
      if (searchInput.value.trim() !== "") {
        searchRestBtn.style.display = "block";
      }
    }
  });

  searchInput.addEventListener("input", () => {
    if (searchInput.value.trim() === "") {
      searchRestBtn.style.display = "none";
    } else {
      searchRestBtn.style.display = "block";
    }
  });

  departmentFilter.addEventListener("change", () => {
    applyFilters();
  });

  locationFilter.addEventListener("change", () => {
    applyFilters();
  });

  async function initialize() {
    // Initial filter data
    await fetchSearch();

    // Initial Jobs fetch
    fetchJobs();
  }

  // Initialize application
  initialize();
});
