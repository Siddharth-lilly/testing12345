# app/prompts/design_prompts.py - Design stage AI prompts
"""
AI prompts for the Design stage.
Contains prompts for architecture generation.
"""

DESIGN_SYSTEM_PROMPT = """You are a Solution Architect AI assistant specializing in enterprise software architecture.
Your task is to analyze project requirements and generate 3 distinct solution architecture options.

You MUST respond with valid JSON only. No markdown, no code blocks, no explanations outside JSON.

For each option, provide:
1. A unique approach (e.g., low-code, custom development, existing platform extension)
2. Realistic cost estimates based on typical industry rates
3. Mermaid diagram code for architecture visualization
4. Honest pros and cons
5. Clear recommendation reasoning

Consider:
- Scalability requirements
- Compliance needs (HIPAA, GDPR, SOX, etc.)
- Team expertise and learning curve
- Time to market
- Total cost of ownership
- Integration complexity
- Maintenance burden

Generate diagrams using Mermaid syntax that will render properly."""

DESIGN_USER_PROMPT_TEMPLATE = """Based on the following project context, generate 3 solution architecture options.

## Project Context

### Problem Statement:
{problem_statement}

### Stakeholder Analysis:
{stakeholder_analysis}

### Business Requirements Document:
{brd_content}

### User Stories:
{user_stories}

### Constraints & Preferences:
{constraints}

### Additional Files/Context:
{additional_context}

---

Generate exactly 3 architecture options with this JSON structure:
{{
  "analysis_summary": "Brief analysis of requirements and key architectural drivers",
  "recommended_option": "option_1" | "option_2" | "option_3",
  "recommendation_reasoning": "Why this option is recommended",
  "options": {{
    "option_1": {{
      "id": "option_1",
      "name": "Option name (e.g., 'Power Platform Suite')",
      "tagline": "One-line description",
      "complexity": "Low" | "Medium" | "High",
      "monthly_cost": "$X,XXX",
      "mvp_timeline_weeks": 4,
      "tech_stack": ["Tech1", "Tech2", "Tech3"],
      "strengths": [
        "Strength 1",
        "Strength 2",
        "Strength 3"
      ],
      "tradeoffs": [
        "Tradeoff 1",
        "Tradeoff 2",
        "Tradeoff 3"
      ],
      "scalability": "Low" | "Medium" | "High",
      "compliance_fit": "Poor" | "Good" | "Excellent",
      "architecture_diagram": "graph TD\\n    A[Client] --> B[API Gateway]\\n    B --> C[Service]",
      "detailed_description": "Full description of the architecture approach...",
      "components": [
        {{
          "name": "Component Name",
          "description": "What it does",
          "technology": "Specific tech"
        }}
      ],
      "database_design": {{
        "type": "SQL/NoSQL/Hybrid",
        "technology": "PostgreSQL/MongoDB/etc",
        "schema_overview": "Brief schema description",
        "diagram": "erDiagram\\n    USER ||--o{{ ORDER : places"
      }},
      "api_design": {{
        "style": "REST/GraphQL/gRPC",
        "key_endpoints": [
          "POST /api/resource",
          "GET /api/resource/:id"
        ]
      }},
      "security_considerations": [
        "Security point 1",
        "Security point 2"
      ],
      "deployment_diagram": "graph LR\\n    A[Dev] --> B[Staging] --> C[Prod]",
      "risk_assessment": [
        {{
          "risk": "Risk description",
          "mitigation": "How to mitigate",
          "severity": "Low" | "Medium" | "High"
        }}
      ],
      "implementation_phases": [
        {{
          "phase": "Phase 1: Foundation",
          "duration_weeks": 2,
          "deliverables": ["Deliverable 1", "Deliverable 2"]
        }}
      ]
    }},
    "option_2": {{ ... same structure ... }},
    "option_3": {{ ... same structure ... }}
  }}
}}

Important:
- Make options genuinely different (e.g., build vs buy vs hybrid)
- Be realistic about costs and timelines
- Mermaid diagrams must use \\n for newlines in JSON
- Consider the specific compliance requirements mentioned
- Factor in team expertise if provided"""
