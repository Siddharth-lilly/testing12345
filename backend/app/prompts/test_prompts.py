# app/prompts/test_prompts.py - Test stage AI prompts
"""
AI prompts for the Test stage.
Contains prompts for test plan and test case generation.
"""

TEST_PLAN_SYSTEM_PROMPT = """You are a Senior QA Lead creating a comprehensive test plan for a software development project.

Your task is to analyze the project artifacts (requirements, user stories, architecture, and development tickets) and create a detailed test plan document.

You MUST respond with valid JSON only. No markdown, no code blocks, no explanations outside JSON.

Create a test plan that covers:
1. Testing scope and objectives
2. Test strategy (types of testing to perform)
3. Test environment requirements
4. Entry and exit criteria
5. Risk assessment and mitigation
6. Resource requirements
7. Schedule and milestones
8. Deliverables

The test plan should be thorough, practical, and aligned with industry best practices."""

TEST_PLAN_USER_PROMPT = """Based on the following project artifacts, generate a comprehensive test plan.

## Project Overview
{problem_statement}

## Business Requirements Document
{brd_content}

## User Stories
{user_stories}

## Selected Architecture
{architecture}

## Development Tickets
{tickets_summary}

---

Generate the test plan with this JSON structure:
{{
  "test_plan": {{
    "document_info": {{
      "title": "Test Plan - [Project Name]",
      "version": "1.0",
      "created_date": "{current_date}",
      "status": "Draft"
    }},
    "executive_summary": "Brief overview of the testing approach and scope...",
    "scope": {{
      "in_scope": [
        "Feature/functionality 1",
        "Feature/functionality 2"
      ],
      "out_of_scope": [
        "Items explicitly not being tested"
      ]
    }},
    "test_strategy": {{
      "testing_types": [
        {{
          "type": "Unit Testing",
          "description": "Test individual components in isolation",
          "coverage_target": "80%",
          "tools": ["pytest", "jest"],
          "responsibility": "Developers"
        }},
        {{
          "type": "Integration Testing",
          "description": "Test component interactions",
          "coverage_target": "70%",
          "tools": ["pytest", "Postman"],
          "responsibility": "QA Team"
        }},
        {{
          "type": "End-to-End Testing",
          "description": "Test complete user workflows",
          "coverage_target": "Critical paths 100%",
          "tools": ["Playwright", "Cypress"],
          "responsibility": "QA Team"
        }},
        {{
          "type": "Performance Testing",
          "description": "Load and stress testing",
          "coverage_target": "Key endpoints",
          "tools": ["k6", "JMeter"],
          "responsibility": "QA Team"
        }},
        {{
          "type": "Security Testing",
          "description": "Vulnerability assessment",
          "coverage_target": "OWASP Top 10",
          "tools": ["OWASP ZAP"],
          "responsibility": "Security Team"
        }}
      ],
      "test_levels": ["Component", "Integration", "System", "Acceptance"],
      "automation_approach": "Description of automation strategy..."
    }},
    "test_environment": {{
      "environments": [
        {{
          "name": "Development",
          "purpose": "Developer testing",
          "infrastructure": "Local or shared dev server"
        }},
        {{
          "name": "QA/Staging",
          "purpose": "Formal testing",
          "infrastructure": "Production-like environment"
        }},
        {{
          "name": "UAT",
          "purpose": "User acceptance testing",
          "infrastructure": "Production-like environment"
        }}
      ],
      "test_data_strategy": "Approach for test data management...",
      "tools_and_infrastructure": ["List of required tools"]
    }},
    "entry_exit_criteria": {{
      "entry_criteria": [
        "Code is deployed to test environment",
        "Unit tests pass with 80% coverage",
        "Test data is prepared"
      ],
      "exit_criteria": [
        "All critical test cases pass",
        "No high-severity defects open",
        "Coverage targets met",
        "Performance benchmarks achieved"
      ],
      "suspension_criteria": [
        "Critical defect blocking further testing",
        "Environment unavailable"
      ]
    }},
    "risk_assessment": [
      {{
        "risk": "Risk description",
        "probability": "High/Medium/Low",
        "impact": "High/Medium/Low",
        "mitigation": "How to mitigate this risk"
      }}
    ],
    "resources": {{
      "roles": [
        {{
          "role": "QA Lead",
          "responsibilities": ["Test planning", "Review", "Reporting"],
          "allocation": "Full-time"
        }},
        {{
          "role": "QA Engineer",
          "responsibilities": ["Test case creation", "Test execution", "Defect logging"],
          "allocation": "Full-time"
        }}
      ],
      "tools": ["List of testing tools required"]
    }},
    "schedule": {{
      "phases": [
        {{
          "phase": "Test Planning",
          "duration": "1 week",
          "deliverables": ["Test Plan", "Test Cases"]
        }},
        {{
          "phase": "Test Development",
          "duration": "2 weeks",
          "deliverables": ["Automated test scripts", "Test data"]
        }},
        {{
          "phase": "Test Execution",
          "duration": "2 weeks",
          "deliverables": ["Test results", "Defect reports"]
        }},
        {{
          "phase": "UAT",
          "duration": "1 week",
          "deliverables": ["UAT sign-off"]
        }}
      ],
      "milestones": [
        {{
          "milestone": "Test Plan Approved",
          "target_date": "Week 1"
        }},
        {{
          "milestone": "Test Cases Complete",
          "target_date": "Week 2"
        }},
        {{
          "milestone": "Testing Complete",
          "target_date": "Week 5"
        }}
      ]
    }},
    "deliverables": [
      "Test Plan (this document)",
      "Test Cases",
      "Test Execution Reports",
      "Defect Reports",
      "Test Summary Report"
    ],
    "metrics": [
      {{
        "metric": "Test Coverage",
        "target": "80%",
        "measurement": "Code coverage tools"
      }},
      {{
        "metric": "Defect Detection Rate",
        "target": ">90% pre-production",
        "measurement": "Defects found in testing vs production"
      }},
      {{
        "metric": "Test Execution Progress",
        "target": "100% planned tests",
        "measurement": "Tests executed / Tests planned"
      }}
    ]
  }},
  "summary": {{
    "total_testing_types": 5,
    "total_environments": 3,
    "estimated_duration": "6 weeks",
    "key_risks": 3
  }}
}}

Generate a comprehensive test plan tailored to the specific project requirements and architecture."""


TEST_CASES_SYSTEM_PROMPT = """You are a Senior QA Engineer creating detailed test cases for a software development project.

Your task is to analyze the project artifacts and create specific, actionable test cases that cover all functional and non-functional requirements.

You MUST respond with valid JSON only. No markdown, no code blocks, no explanations outside JSON.

Create test cases that are:
1. Clear and unambiguous - anyone can execute them
2. Independent - each test can run on its own
3. Traceable - linked to requirements/user stories
4. Prioritized - based on risk and business value
5. Complete - include preconditions, steps, and expected results

Test case types to include:
- Positive tests (happy path)
- Negative tests (error handling)
- Boundary tests (edge cases)
- Security tests
- Performance tests (where applicable)"""

TEST_CASES_USER_PROMPT = """Based on the following project artifacts, generate comprehensive test cases.

## User Stories
{user_stories}

## Business Requirements
{brd_content}

## Architecture Overview
{architecture}

## Development Tickets
{tickets_summary}

---

Generate test cases with this JSON structure:
{{
  "test_suites": [
    {{
      "suite_id": "TS-001",
      "name": "User Authentication",
      "description": "Test cases for user authentication functionality",
      "priority": "High",
      "related_tickets": ["DEV-101", "DEV-102"],
      "test_cases": [
        {{
          "case_id": "TC-001",
          "title": "Valid user login with correct credentials",
          "description": "Verify that a user can successfully log in with valid credentials",
          "type": "Functional",
          "priority": "Critical",
          "category": "Positive",
          "preconditions": [
            "User account exists in the system",
            "User is on the login page",
            "User has valid credentials"
          ],
          "test_data": {{
            "username": "testuser@example.com",
            "password": "ValidP@ssw0rd"
          }},
          "steps": [
            {{
              "step": 1,
              "action": "Enter valid username in the username field",
              "expected_result": "Username is displayed in the field"
            }},
            {{
              "step": 2,
              "action": "Enter valid password in the password field",
              "expected_result": "Password is masked and displayed as dots"
            }},
            {{
              "step": 3,
              "action": "Click the Login button",
              "expected_result": "User is redirected to the dashboard"
            }}
          ],
          "expected_result": "User is successfully authenticated and redirected to dashboard",
          "postconditions": [
            "User session is created",
            "User can access protected resources"
          ],
          "tags": ["login", "authentication", "happy-path"]
        }},
        {{
          "case_id": "TC-002",
          "title": "Invalid login with wrong password",
          "description": "Verify that login fails with incorrect password",
          "type": "Functional",
          "priority": "High",
          "category": "Negative",
          "preconditions": [
            "User account exists in the system",
            "User is on the login page"
          ],
          "test_data": {{
            "username": "testuser@example.com",
            "password": "WrongPassword123"
          }},
          "steps": [
            {{
              "step": 1,
              "action": "Enter valid username",
              "expected_result": "Username is accepted"
            }},
            {{
              "step": 2,
              "action": "Enter incorrect password",
              "expected_result": "Password is accepted in field"
            }},
            {{
              "step": 3,
              "action": "Click Login button",
              "expected_result": "Error message is displayed: 'Invalid credentials'"
            }}
          ],
          "expected_result": "Login fails with appropriate error message",
          "postconditions": [
            "User remains on login page",
            "No session is created"
          ],
          "tags": ["login", "authentication", "negative-test", "security"]
        }}
      ]
    }}
  ],
  "summary": {{
    "total_suites": 5,
    "total_test_cases": 25,
    "by_priority": {{
      "Critical": 8,
      "High": 10,
      "Medium": 5,
      "Low": 2
    }},
    "by_category": {{
      "Positive": 15,
      "Negative": 7,
      "Boundary": 3
    }},
    "by_type": {{
      "Functional": 18,
      "Security": 4,
      "Performance": 3
    }},
    "coverage": {{
      "user_stories_covered": ["US-001", "US-002", "US-003"],
      "tickets_covered": ["DEV-101", "DEV-102", "DEV-103"]
    }}
  }}
}}

Generate 15-30 test cases covering all major features and critical paths.
Group test cases into logical suites.
Ensure coverage of positive, negative, and edge cases for each feature."""


RUN_TESTS_SYSTEM_PROMPT = """You are a QA Automation Engineer simulating test execution results.

Based on the test cases provided, generate realistic test execution results that simulate what would happen if these tests were actually run against the system.

You MUST respond with valid JSON only. No markdown, no code blocks, no explanations outside JSON.

Simulate realistic outcomes:
- Most tests should pass (70-85%)
- Some tests should fail with realistic error messages
- A few tests might be blocked or skipped
- Include realistic execution times
- Include detailed failure information for failed tests"""

RUN_TESTS_USER_PROMPT = """Simulate the execution of the following test cases:

## Test Cases
{test_cases}

## Architecture Context
{architecture}

---

Generate test execution results with this JSON structure:
{{
  "test_run": {{
    "run_id": "TR-{timestamp}",
    "started_at": "{start_time}",
    "completed_at": "{end_time}",
    "environment": "QA/Staging",
    "executed_by": "Automated/QA Engineer",
    "build_version": "1.0.0-beta"
  }},
  "results": [
    {{
      "case_id": "TC-001",
      "title": "Test case title",
      "status": "passed",
      "execution_time_ms": 1250,
      "executed_at": "2024-01-15T10:30:00Z",
      "notes": "Test completed successfully"
    }},
    {{
      "case_id": "TC-002",
      "title": "Test case title",
      "status": "failed",
      "execution_time_ms": 3500,
      "executed_at": "2024-01-15T10:32:00Z",
      "failure_details": {{
        "step_failed": 3,
        "expected": "User redirected to dashboard",
        "actual": "Error 500: Internal Server Error",
        "screenshot": "screenshots/TC-002-failure.png",
        "logs": "Connection timeout after 30s"
      }},
      "defect_id": "BUG-001"
    }},
    {{
      "case_id": "TC-003",
      "title": "Test case title",
      "status": "blocked",
      "execution_time_ms": 0,
      "executed_at": "2024-01-15T10:35:00Z",
      "blocked_reason": "Dependent on TC-002 which failed"
    }},
    {{
      "case_id": "TC-004",
      "title": "Test case title",
      "status": "skipped",
      "execution_time_ms": 0,
      "executed_at": "2024-01-15T10:35:00Z",
      "skip_reason": "Feature not implemented yet"
    }}
  ],
  "defects_found": [
    {{
      "defect_id": "BUG-001",
      "title": "Login fails with 500 error under load",
      "severity": "High",
      "priority": "Critical",
      "test_case": "TC-002",
      "description": "When multiple users attempt to log in simultaneously, the system returns a 500 Internal Server Error",
      "steps_to_reproduce": [
        "Navigate to login page",
        "Enter valid credentials",
        "Click login while another user is logging in"
      ],
      "expected_result": "Both users should be able to log in",
      "actual_result": "One user gets 500 error",
      "environment": "QA",
      "status": "Open",
      "assigned_to": "Developer"
    }}
  ],
  "summary": {{
    "total_tests": 25,
    "passed": 20,
    "failed": 3,
    "blocked": 1,
    "skipped": 1,
    "pass_rate": 80.0,
    "total_execution_time_ms": 125000,
    "defects_found": 2,
    "critical_defects": 1,
    "test_coverage": "85%"
  }},
  "recommendations": [
    "Fix BUG-001 before proceeding to UAT",
    "Re-run failed tests after fixes",
    "Consider adding more load testing for login flow"
  ]
}}

Simulate realistic test results based on the complexity and nature of the test cases."""