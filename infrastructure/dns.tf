####################################################
# Zone
####################################################
resource "aws_route53_zone" "main" {
  name = var.environment == "prd" ? var.domain_name : "${var.environment}.${var.domain_name}"

  lifecycle {
    create_before_destroy = true
  }
}

####################################################
# Certificate (Tokyo)
####################################################
resource "aws_acm_certificate" "cert" {
  domain_name               = var.environment == "prd" ? var.domain_name : "${var.environment}.${var.domain_name}"
  subject_alternative_names = ["*.${var.environment == "prd" ? var.domain_name : "${var.environment}.${var.domain_name}"}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cert"
  }
}

resource "aws_route53_record" "cert" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  allow_overwrite = true
  zone_id         = aws_route53_zone.main.zone_id
  name            = each.value.name
  type            = each.value.type
  ttl             = 60
  records         = [each.value.record]
}

resource "aws_acm_certificate_validation" "cert" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert : record.fqdn]
}

####################################################
# Certificate (Virginia)
####################################################

resource "aws_acm_certificate" "cert_in_virginia" {
  provider                  = aws.virginia # To use certificates on CloudFront, you only designate ones in us-east-1.
  domain_name               = aws_acm_certificate.cert.domain_name
  subject_alternative_names = aws_acm_certificate.cert.subject_alternative_names
  validation_method         = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_in_virginia" {
  for_each = {
    for dvo in aws_acm_certificate.cert_in_virginia.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  zone_id         = aws_route53_zone.main.zone_id
  name            = each.value.name
  type            = each.value.type
  ttl             = 60
  records         = [each.value.record]
}

resource "aws_acm_certificate_validation" "cert_in_virginia" {
  provider                = aws.virginia # To validate certificates, you only can use resources in the same region.
  certificate_arn         = aws_acm_certificate.cert_in_virginia.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_in_virginia : record.fqdn]
}

####################################################
# DNS Records
####################################################
resource "aws_route53_record" "app" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.environment == "prd" ? var.domain_name : "${var.environment}.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.app.dns_name
    zone_id                = aws_lb.app.zone_id
    evaluate_target_health = true
  }
}
