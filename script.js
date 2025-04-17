document.addEventListener("DOMContentLoaded", function () {
  const jobList = document.getElementById("job-list");
  const searchInput = document.getElementById("job-search");
  const departmentFilter = document.getElementById("department-filter");
  const locationFilter = document.getElementById("location-filter");
  const searchBtn = document.getElementById("search-btn");

  const greenhouseConfig = {
    boardToken: "bayasystems",
    apiUrl: "https://boards-api.greenhouse.io/v1/boards/",
  };

  let jobData = [];
  let departmentsData = [];
  let officesData = [];
  let currentSelectedDepartment;

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
      jobData = data.jobs || [];

      renderJobs(jobData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      jobList.innerHTML =
        '<div class="error">Error loading jobs. Please try again later.</div>';
    }
  }

  async function getFilteredJobs(keyword) {
    jobList.innerHTML = '<div class="loading">Loading jobs...</div>';

    const response = await fetch(
      `${greenhouseConfig.apiUrl}${greenhouseConfig.boardToken}/jobs`
    );

    const data = await response.json();
    const filtered = data.jobs.filter((job) =>
      job.title.toLowerCase().includes(keyword.toLowerCase())
    );

    renderJobs(filtered);
  }

  function renderJobs(jobs) {
    if (jobs?.length === 0) {
      jobList.innerHTML =
        '<div class="loading">No jobs found matching your criteria.</div>';
      return;
    }

    jobList.innerHTML = "";

    // <div class="job-department">${
    //   job.departments[0]?.name || "General"
    // }</div>

    jobs?.map((job, index) => {
      const jobLocation = job.location ? job.location.name : "Remote";
      const jobElement = document.createElement("div");
      jobElement.className = "job-card";
      jobElement.innerHTML = `
            <div class="job-info" data-job-id="${job.id}">
              <div class="job-location">${jobLocation}</div>
              <h2 class="job-title">${job.title}</h2>
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
            </button>
          `;

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
        open(
          `https://job-boards.greenhouse.io/bayasystems/jobs/${jobId}`,
          "_blank"
        );
      });
    });

    document.querySelectorAll(".job-info").forEach((button) => {
      button.addEventListener("click", (e) => {
        const jobId = e.currentTarget.getAttribute("data-job-id");
        open(
          `https://job-boards.greenhouse.io/bayasystems/jobs/${jobId}`,
          "_blank"
        );
      });
    });
  }

  function renderDepartments(department) {
    const departmentEle = document.getElementById("department-filter");

    department?.map((dep) => {
      const individualOption = document.createElement("option");
      individualOption.setAttribute("value", dep.id);
      individualOption.text = dep.name;

      departmentEle.appendChild(individualOption);
    });
  }

  function renderOffices(office) {
    const officeEle = document.getElementById("location-filter");

    office?.map((dep) => {
      const individualOption = document.createElement("option");
      individualOption.setAttribute("value", dep.id);
      individualOption.text = dep.name;

      officeEle.appendChild(individualOption);
    });
  }

  searchBtn.addEventListener("click", () => {
    getFilteredJobs(searchInput.value);
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      getFilteredJobs(e.target.value);
    }
  });

  departmentFilter.addEventListener("change", (e) => {
    const { value } = e.target;
    locationFilter.value = "";
    jobData = departmentsData?.find((item) => item?.id === Number(value))?.jobs;
    currentSelectedDepartment = value;
    renderJobs(jobData);
  });

  locationFilter.addEventListener("change", (e) => {
    const { value } = e.target;
    const updatedOffice = officesData?.find(
      (item) => item?.id === Number(value)
    );

    if (currentSelectedDepartment) {
      jobData = updatedOffice?.departments?.find(
        (item) => item?.id === Number(currentSelectedDepartment)
      )?.jobs;
      renderJobs(jobData);
    }
  });

  // Initial filter data
  fetchSearch();

  // Initial fetch
  fetchJobs();

  // function loadMockData() {
  //   const mockJobs = [
  //     {
  //       id: 1,
  //       title: "Solutions Architect",
  //       location: { name: "Bengaluru, Karnataka, India" },
  //       departments: [{ name: "Commercial" }],
  //     },
  //     {
  //       id: 2,
  //       title: "Solutions Architect",
  //       location: { name: "(US) Santa Clara, California" },
  //       departments: [{ name: "Commercial" }],
  //     },
  //     {
  //       id: 3,
  //       title: "Senior Software Engineer",
  //       location: { name: "Remote" },
  //       departments: [{ name: "Engineering" }],
  //     },
  //     {
  //       id: 4,
  //       title: "Product Marketing Manager",
  //       location: { name: "New York, NY" },
  //       departments: [{ name: "Marketing" }],
  //     },
  //   ];

  //   renderJobs(mockJobs);
  // }

  // loadMockData();
});
